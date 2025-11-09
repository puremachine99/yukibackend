import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { addDays } from 'date-fns';
import { PayCartDto } from './dto/pay-cart.dto';
import { CartStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  async getUserCart(userId: number) {
    return this.prisma.cart.findMany({
      where: { buyerId: userId, status: { not: CartStatus.expired } },
      include: {
        itemOnAuction: { include: { item: true, auction: true } },
      },
    });
  }

  async addToCart(userId: number, itemOnAuctionId: number) {
    const item = await this.prisma.itemOnAuction.findUnique({
      where: { id: itemOnAuctionId },
      include: { item: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    if (item.status !== 'active')
      throw new ForbiddenException('Item not available for cart');

    const cart = await this.prisma.cart.create({
      data: {
        buyerId: userId,
        itemOnAuctionId,
        price: item.item.buyItNow ?? item.item.startingBid,
        expiresAt: addDays(new Date(), 3),
      },
    });

    await this.notification.create(
      userId,
      'cart_add',
      `You added ${item.item.name} to your cart.`,
      { cartId: cart.id },
    );

    await this.activity.log(userId, 'ADD_TO_CART', {
      itemOnAuctionId,
      price: cart.price,
    });

    return cart;
  }

  async simulatePayment(userId: number, cartId: number, dto: PayCartDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, buyerId: userId },
      include: { itemOnAuction: { include: { auction: true } } },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.isPaid) throw new ForbiddenException('Cart already paid');

    const paidCart = await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        isPaid: true,
        status: CartStatus.completed,
        paidAt: new Date(),
      },
    });

    // simpan transaksi dummy biar ke tahap berikutnya gampang
    await this.prisma.transaction.create({
      data: {
        cartId: paidCart.id,
        buyerId: userId,
        sellerId: cart.itemOnAuction.auction.userId,
        totalAmount: cart.price,
        itemPrice: cart.price,
        paymentGateway: dto.paymentMethod || 'manual',
        status: TransactionStatus.paid,
        paidAt: new Date(),
      },
    });

    await this.notification.create(
      userId,
      'payment',
      `Payment confirmed for cart #${cart.id} via ${dto.paymentMethod || 'manual'}`,
      { cartId: cart.id },
    );

    await this.activity.log(userId, 'PAY_CART', {
      cartId,
      payment: dto.paymentMethod,
    });

    return paidCart;
  }
}
