import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [users, auctions, transactions, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.auction.count({ where: { status: 'active' } }),
      this.prisma.transaction.count({ where: { status: 'paid' } }),
      this.prisma.revenueSummary.findMany({
        orderBy: { date: 'desc' },
        take: 7,
      }),
    ]);

    const totalRevenue = revenue.reduce(
      (sum, r) => sum + Number(r.totalRevenue),
      0,
    );

    return {
      totalUsers: users,
      activeAuctions: auctions,
      paidTransactions: transactions,
      totalRevenue,
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
      },
      orderBy: { id: 'asc' },
    });
  }

  async banUser(id: number) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isBanned: true },
    });
    return { message: `User ${user.name} has been banned.` };
  }

  async getPendingWithdrawals() {
    return this.prisma.withdrawal.findMany({
      where: { status: 'pending' },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getRevenueSummary() {
    return this.prisma.revenueSummary.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    });
  }
}
