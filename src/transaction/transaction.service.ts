import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  async getSummaryByDate(date: Date) {
    return this.prisma.revenueSummary.findUnique({ where: { date } });
  }

  async findAllByUser(userId: number) {
    return this.prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        cart: true,
        seller: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payTransaction(userId: number, cartId: number, dto: PayTransactionDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { id: cartId, buyerId: userId },
      include: {
        itemOnAuction: {
          include: {
            auction: true,
            item: { include: { owner: true } },
          },
        },
      },
    });

    if (!cart) throw new NotFoundException('Cart not found');
    if (cart.isPaid) throw new ForbiddenException('Cart already paid');

    const transaction = await this.prisma.transaction.create({
      data: {
        cartId: cart.id,
        buyerId: userId,
        sellerId: cart.itemOnAuction.auction.userId,
        totalAmount: cart.price,
        itemPrice: cart.price,
        paymentGateway: dto.paymentMethod || 'manual',
        status: 'paid',
        paidAt: new Date(),
      },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { isPaid: true, status: 'completed', paidAt: new Date() },
    });

    // ✅ Update SellerBalance (gross sales tracked as totalSales; platform fee handled separately)
    await this.prisma.sellerBalance.upsert({
      where: { sellerId: transaction.sellerId },
      update: {
        totalSales: { increment: transaction.totalAmount },
        netBalance: { increment: transaction.totalAmount },
      },
      create: {
        sellerId: transaction.sellerId,
        totalSales: transaction.totalAmount,
        netBalance: transaction.totalAmount,
      },
    });

    // ✅ Mark item as sold
    if (cart.itemOnAuction?.item?.id) {
      await this.prisma.item.update({
        where: { id: cart.itemOnAuction.item.id },
        data: { isSold: true },
      });

      const notifiedSellerIds = new Set<number>();
      const sellerCandidates = [
        cart.itemOnAuction.auction?.userId,
        cart.itemOnAuction.item.owner?.id,
      ].filter((id): id is number => Boolean(id) && id !== userId);

      for (const sellerId of sellerCandidates) {
        if (notifiedSellerIds.has(sellerId)) continue;
        notifiedSellerIds.add(sellerId);
        await this.notification.create(
          sellerId,
          'item_sold',
          `Your item "${cart.itemOnAuction.item.name}" has been sold.`,
          { transactionId: transaction.id, itemId: cart.itemOnAuction.item.id },
        );
      }
    }

    // ✅ Update / Upsert RevenueSummary for today (platform metrics)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const adminFee = transaction.adminFee ?? new Prisma.Decimal(0);
    await this.prisma.revenueSummary.upsert({
      where: { date: today },
      update: {
        totalRevenue: { increment: adminFee },
        totalFee: { increment: adminFee },
        totalTransaction: { increment: 1 },
      },
      create: {
        date: today,
        periodType: 'daily',
        totalRevenue: adminFee,
        totalFee: adminFee,
        totalTransaction: 1,
        totalWithdrawal: 0,
      },
    });

    // 🧾 Optional: add transaction log
    await this.prisma.transactionLog.create({
      data: {
        referenceType: 'TRANSACTION',
        referenceId: transaction.id,
        amount: transaction.totalAmount,
        direction: 'in',
        note: `Buyer #${userId} paid Seller #${transaction.sellerId}`,
      },
    });

    await this.notification.create(
      transaction.sellerId,
      'payment_received',
      `Payment received for transaction #${transaction.id}`,
      { transactionId: transaction.id },
    );

    await this.notification.create(
      userId,
      'transaction_completed',
      `Transaction #${transaction.id} completed successfully.`,
      { transactionId: transaction.id },
    );

    await this.activity.log(userId, 'MAKE_PAYMENT', {
      transactionId: transaction.id,
      paymentMethod: dto.paymentMethod,
    });

    await this.activity.log(transaction.sellerId, 'RECEIVE_PAYMENT', {
      transactionId: transaction.id,
      buyerId: userId,
    });

    return transaction;
  }

  async getSellerRevenueSummary(sellerId: number) {
    const balances = await this.prisma.sellerBalance.findMany({
      where: { sellerId },
    });
    return balances.map((b) => ({
      totalSales: b.totalSales,
      netBalance: b.netBalance,
      status: b.status,
    }));
  }
}
