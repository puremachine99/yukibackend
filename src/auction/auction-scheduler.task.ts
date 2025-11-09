import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { addSeconds } from 'date-fns';

@Injectable()
export class AuctionSchedulerTask {
  private readonly logger = new Logger(AuctionSchedulerTask.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkReadyAuctions() {
    const now = new Date();
    const readyAuctions = await this.prisma.auction.findMany({
      where: { status: 'ready', startTime: { lte: now } },
    });

    for (const auction of readyAuctions) {
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: 'active' },
      });

      await this.notification.create(
        auction.userId,
        'auction_start',
        `Your auction "${auction.title}" has started.`,
        { auctionId: auction.id },
      );

      this.logger.log(`Auction #${auction.id} → ACTIVE`);
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkEndingAuctions() {
    const now = new Date();

    const activeAuctions = await this.prisma.auction.findMany({
      where: { status: 'active' },
    });

    for (const auction of activeAuctions) {
      const endWithExtra = addSeconds(auction.endTime, auction.extraTime || 0);
      if (now >= endWithExtra) {
        await this.prisma.auction.update({
          where: { id: auction.id },
          data: { status: 'ended' },
        });

        this.logger.log(`Auction #${auction.id} → ENDED`);
        await this.processEndedAuction(auction.id);
      }
    }
  }

  /** 🔥 Proses otomatis setelah auction berakhir */
  private async processEndedAuction(auctionId: number) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        items: {
          include: {
            item: true,
            bids: {
              orderBy: { amount: 'desc' },
              include: { user: true },
            },
          },
        },
        user: true,
      },
    });

    if (!auction) return;

    for (const ioa of auction.items) {
      const topBid = ioa.bids[0];
      if (!topBid) {
        this.logger.log(
          `Auction #${auction.id} item #${ioa.item.id} has no bids.`,
        );
        continue;
      }

      // 1️⃣ Tandai bid pemenang
      await this.prisma.bid.update({
        where: { id: topBid.id },
        data: { isWin: true },
      });

      // 2️⃣ Tandai item terjual
      await this.prisma.item.update({
        where: { id: ioa.item.id },
        data: { isSold: true },
      });

      // 3️⃣ Buat / update cart otomatis untuk pemenang
      const existingCart = await this.prisma.cart.findUnique({
        where: { itemOnAuctionId: ioa.id },
      });
      const cartPayload = {
        buyerId: topBid.userId,
        price: topBid.amount,
        status: 'pending' as const,
        isPaid: false,
        paidAt: null,
        expiresAt: addSeconds(new Date(), 3 * 24 * 60 * 60),
      };
      if (existingCart) {
        if (existingCart.isPaid) {
          this.logger.warn(
            `Cart for itemOnAuction #${ioa.id} already paid, skipping auto-cart.`,
          );
          continue;
        }
        await this.prisma.cart.update({
          where: { id: existingCart.id },
          data: cartPayload,
        });
      } else {
        await this.prisma.cart.create({
          data: {
            itemOnAuctionId: ioa.id,
            ...cartPayload,
          },
        });
      }

      // 4️⃣ Kirim notifikasi ke buyer & seller
      await this.notification.create(
        topBid.userId,
        'auction_won',
        `You won the auction for "${ioa.item.name}"!`,
        { auctionId: auction.id, itemId: ioa.item.id },
      );

      await this.notification.create(
        auction.userId,
        'item_sold',
        `Your item "${ioa.item.name}" has been sold.`,
        { auctionId: auction.id, itemId: ioa.item.id },
      );

      this.logger.log(
        `Auction #${auction.id} item #${ioa.item.id} winner: ${topBid.user.name}`,
      );
    }
  }
}
