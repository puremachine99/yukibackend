import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  BalanceStatus,
  TransactionStatus,
  WithdrawalStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: BalanceStatus;
}

@Injectable()
export class SellerBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: PaginationParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const where = params.status ? { status: params.status } : undefined;

    const [data, total] = await Promise.all([
      this.prisma.sellerBalance.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.sellerBalance.count({ where }),
    ]);

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
      data: data.map((balance) => this.serializeBalance(balance)),
    };
  }

  async getOverview() {
    const [aggregate, breakdown, topSellers] = await Promise.all([
      this.prisma.sellerBalance.aggregate({
        _sum: { totalSales: true, netBalance: true, adminFee: true },
        _count: { _all: true },
      }),
      this.prisma.sellerBalance.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.sellerBalance.findMany({
        orderBy: { netBalance: 'desc' },
        take: 5,
        include: { seller: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    return {
      totals: {
        sellers: aggregate._count._all,
        totalSales: this.decimalToNumber(aggregate._sum.totalSales),
        totalNetBalance: this.decimalToNumber(aggregate._sum.netBalance),
        totalAdminFee: this.decimalToNumber(aggregate._sum.adminFee),
      },
      statusBreakdown: breakdown.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      topSellers: topSellers.map((balance) => this.serializeBalance(balance)),
    };
  }

  async getSellerDetail(sellerId: number) {
    const balance = await this.prisma.sellerBalance.findUnique({
      where: { sellerId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            reputation: true,
          },
        },
      },
    });

    if (!balance) {
      throw new NotFoundException('Seller balance not found');
    }

    const [recentTransactions, recentWithdrawals, pendingWithdrawals] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          totalAmount: true,
          adminFee: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.withdrawal.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.pendingWithdrawalSummary(sellerId),
    ]);

    return {
      ...this.serializeBalance(balance),
      pendingWithdrawals,
      recentTransactions: recentTransactions.map((tx) => ({
        ...tx,
        totalAmount: this.decimalToNumber(tx.totalAmount),
        adminFee: this.decimalToNumber(tx.adminFee),
      })),
      recentWithdrawals: recentWithdrawals.map((wd) => ({
        ...wd,
        amount: this.decimalToNumber(wd.amount),
      })),
    };
  }

  async getSellerSummary(sellerId: number) {
    const balance = await this.prisma.sellerBalance.findUnique({
      where: { sellerId },
    });
    if (!balance) {
      throw new NotFoundException('Seller balance not found');
    }

    const pendingWithdrawals = await this.pendingWithdrawalSummary(sellerId);

    return {
      ...this.serializeBalance(balance),
      pendingWithdrawals,
    };
  }

  async getSellerChart(
    sellerId: number,
    rangeDays = 7,
  ): Promise<{ date: string; totalSales: number; adminFee: number }[]> {
    const range = Math.max(1, Math.min(rangeDays, 30));
    const start = new Date();
    start.setDate(start.getDate() - (range - 1));
    start.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        sellerId,
        status: TransactionStatus.paid,
        paidAt: { gte: start },
      },
      select: {
        paidAt: true,
        totalAmount: true,
        adminFee: true,
      },
    });

    type SalesPoint = {
      date: string;
      totalSales: number;
      adminFee: number;
    };
    const buckets = new Map<string, { total: number; fee: number }>();
    for (const tx of transactions) {
      if (!tx.paidAt) continue;
      const key = tx.paidAt.toISOString().split('T')[0];
      const bucket = buckets.get(key) ?? { total: 0, fee: 0 };
      bucket.total += this.decimalToNumber(tx.totalAmount);
      bucket.fee += this.decimalToNumber(tx.adminFee);
      buckets.set(key, bucket);
    }

    const series: SalesPoint[] = [];
    for (let i = 0; i < range; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().split('T')[0];
      const bucket = buckets.get(key) ?? { total: 0, fee: 0 };
      series.push({
        date: key,
        totalSales: bucket.total,
        adminFee: bucket.fee,
      });
    }

    return series;
  }

  private serializeBalance(balance: any) {
    return {
      ...balance,
      totalSales: this.decimalToNumber(balance.totalSales),
      netBalance: this.decimalToNumber(balance.netBalance),
      adminFee: this.decimalToNumber(balance.adminFee),
    };
  }

  private decimalToNumber(value?: Prisma.Decimal | number | null) {
    if (value === null || value === undefined) return 0;
    return value instanceof Prisma.Decimal ? Number(value) : value;
  }

  private async pendingWithdrawalSummary(sellerId: number) {
    const aggregate = await this.prisma.withdrawal.aggregate({
      where: {
        sellerId,
        status: { in: [WithdrawalStatus.pending, WithdrawalStatus.approved] },
      },
      _sum: { amount: true },
      _count: { _all: true },
    });

    return {
      count: aggregate._count._all,
      amount: this.decimalToNumber(aggregate._sum.amount),
    };
  }
}
