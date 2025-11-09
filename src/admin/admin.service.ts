import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { NotificationService } from '../notification/notification.service';
import {
  AuctionStatus,
  Prisma,
  WithdrawalStatus,
  AdStatus,
  TransactionStatus,
} from '@prisma/client';
import { ProcessWithdrawalDto } from '../withdrawal/dto/process-withdrawal.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly withdrawalService: WithdrawalService,
    private readonly notificationService: NotificationService,
    private readonly activityService: ActivityService,
  ) {}

  async getDashboard() {
    const [
      totalUsers,
      bannedUsers,
      activeAuctions,
      pendingAuctions,
      paidTransactions,
      revenueSummary,
      sellerBalances,
      pendingWithdrawals,
      pendingAds,
      activeAds,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBanned: true } }),
      this.prisma.auction.count({ where: { status: AuctionStatus.active } }),
      this.prisma.auction.count({ where: { status: AuctionStatus.ready } }),
      this.prisma.transaction.count({
        where: { status: TransactionStatus.paid },
      }),
      this.prisma.revenueSummary.findMany({
        orderBy: { date: 'desc' },
        take: 7,
      }),
      this.prisma.sellerBalance.findMany({
        orderBy: { netBalance: 'desc' },
        take: 5,
        include: { seller: { select: { id: true, name: true } } },
      }),
      this.prisma.withdrawal.count({
        where: { status: WithdrawalStatus.pending },
      }),
      this.prisma.advertisement.count({
        where: { status: AdStatus.pending },
      }),
      this.prisma.advertisement.count({
        where: { status: AdStatus.active },
      }),
    ]);

    return {
      metrics: {
        totalUsers,
        bannedUsers,
        activeAuctions,
        pendingAuctions,
        paidTransactions,
        pendingWithdrawals,
        advertisement: {
          pending: pendingAds,
          active: activeAds,
        },
      },
      recentRevenue: revenueSummary.map((entry) => ({
        date: entry.date,
        totalRevenue: this.decimalToNumber(entry.totalRevenue),
        totalFee: this.decimalToNumber(entry.totalFee),
        totalTransaction: entry.totalTransaction,
        totalWithdrawal: entry.totalWithdrawal,
      })),
      topSellerBalances: sellerBalances.map((balance) => ({
        id: balance.id,
        seller: balance.seller,
        totalSales: this.decimalToNumber(balance.totalSales),
        netBalance: this.decimalToNumber(balance.netBalance),
        adminFee: this.decimalToNumber(balance.adminFee),
        status: balance.status,
      })),
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            auctions: true,
            withdrawals: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async banUser(id: number) {
    return this.setUserBanStatus(id, true);
  }

  async unbanUser(id: number) {
    return this.setUserBanStatus(id, false);
  }

  private async setUserBanStatus(id: number, isBanned: boolean) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBanned },
      select: { id: true, name: true, email: true, isBanned: true },
    });
    return {
      user,
      message: `User ${user.name} has been ${isBanned ? 'banned' : 'unbanned'}.`,
    };
  }

  async getUserOverview(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
        auctions: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        withdrawals: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        sellerBalances: {
          select: {
            id: true,
            totalSales: true,
            netBalance: true,
            adminFee: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      withdrawals: user.withdrawals.map((withdrawal) => ({
        ...withdrawal,
        amount: this.decimalToNumber(withdrawal.amount),
      })),
      sellerBalances: user.sellerBalances.map((balance) => ({
        ...balance,
        totalSales: this.decimalToNumber(balance.totalSales),
        netBalance: this.decimalToNumber(balance.netBalance),
        adminFee: this.decimalToNumber(balance.adminFee),
      })),
    };
  }

  async getAuctions(status?: string) {
    const valid = status && this.isValidAuctionStatus(status);
    return this.prisma.auction.findMany({
      where: valid ? { status: status as AuctionStatus } : undefined,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                isSold: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveAuction(id: number, adminId: number) {
    return this.updateAuctionStatus(id, adminId, AuctionStatus.ready, 'approved');
  }

  async rejectAuction(id: number, adminId: number) {
    return this.updateAuctionStatus(
      id,
      adminId,
      AuctionStatus.cancelled,
      'rejected',
    );
  }

  async reportAuction(id: number, adminId: number) {
    return this.updateAuctionStatus(
      id,
      adminId,
      AuctionStatus.reported,
      'reported',
    );
  }

  private async updateAuctionStatus(
    id: number,
    adminId: number,
    status: AuctionStatus,
    notificationType: 'approved' | 'rejected' | 'reported',
  ) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      select: { id: true, title: true, userId: true },
    });
    if (!auction) throw new NotFoundException('Auction not found');

    const updated = await this.prisma.auction.update({
      where: { id },
      data: { status, updatedBy: adminId },
    });

    const messages = {
      approved: `Your auction "${auction.title}" has been approved and will go live on schedule.`,
      rejected: `Your auction "${auction.title}" was rejected by the admin team.`,
      reported: `Your auction "${auction.title}" has been reported and is under review.`,
    };

    await this.notificationService.create(
      auction.userId,
      `auction_${notificationType}`,
      messages[notificationType],
      { auctionId: auction.id, status },
    );

    await this.activityService.log(adminId, `ADMIN_AUCTION_${notificationType.toUpperCase()}`, {
      auctionId: auction.id,
      targetUserId: auction.userId,
      status,
    });

    return updated;
  }

  async getPendingWithdrawals() {
    return this.getWithdrawals(WithdrawalStatus.pending);
  }

  async getWithdrawals(status?: WithdrawalStatus | string) {
    return this.withdrawalService.adminListAll(status);
  }

  async processWithdrawal(
    adminId: number,
    id: number,
    dto: ProcessWithdrawalDto,
  ) {
    return this.withdrawalService.processWithdrawal(adminId, id, dto);
  }

  async getRevenueSummary() {
    const summary = await this.prisma.revenueSummary.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });

    return summary.map((entry) => ({
      ...entry,
      totalRevenue: this.decimalToNumber(entry.totalRevenue),
      totalFee: this.decimalToNumber(entry.totalFee),
    }));
  }

  private decimalToNumber(value: Prisma.Decimal | number | null | undefined) {
    if (value === null || value === undefined) return 0;
    return value instanceof Prisma.Decimal ? Number(value) : value;
  }

  private isValidAuctionStatus(status: string): status is AuctionStatus {
    return (Object.values(AuctionStatus) as string[]).includes(status);
  }
}
