import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { CartStatus } from '@prisma/client';

@Injectable()
export class CartExpiryTask {
  private readonly logger = new Logger(CartExpiryTask.name);

  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  /**
   * Runs every night at 00:00 — marks unpaid carts older than expiresAt as expired
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredCarts() {
    this.logger.log('Running cart expiry cleanup...');

    // ambil semua cart yang kadaluarsa tapi belum expired
    const expiredCarts = await this.prisma.cart.findMany({
      where: {
        isPaid: false,
        status: CartStatus.pending,
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredCarts.length === 0) {
      this.logger.log('No expired carts found.');
      return;
    }

    for (const cart of expiredCarts) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { status: CartStatus.expired },
      });

      // optional auto-ban user (kalo mau, uncomment)
      // await this.prisma.user.update({
      //   where: { id: cart.buyerId },
      //   data: { isBanned: true },
      // });

      await this.notification.create(
        cart.buyerId,
        'cart_expired',
        `Your cart #${cart.id} has expired due to inactivity.`,
        { cartId: cart.id },
      );

      await this.activity.log(cart.buyerId, 'CART_EXPIRED', {
        cartId: cart.id,
        expiredAt: new Date(),
      });

      this.logger.warn(`Cart #${cart.id} expired and user notified.`);
    }

    this.logger.log(`Expired carts processed: ${expiredCarts.length}`);
  }
}
