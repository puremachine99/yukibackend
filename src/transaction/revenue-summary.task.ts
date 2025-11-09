import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RevenueSummaryTask {
  private readonly logger = new Logger(RevenueSummaryTask.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailySummary() {
    this.logger.log('Generating daily revenue summary...');

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'paid',
        paidAt: { gte: start, lte: end },
      },
    });

    if (transactions.length === 0) {
      this.logger.log('No paid transactions today.');
      return;
    }

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + Number(t.totalAmount),
      0,
    );
    const totalFee = transactions.reduce(
      (sum, t) => sum + Number(t.adminFee || 0),
      0,
    );

    const summaryDate = new Date(start);

    await this.prisma.revenueSummary.upsert({
      where: { date: summaryDate },
      update: {
        totalRevenue: new Prisma.Decimal(totalRevenue),
        totalFee: new Prisma.Decimal(totalFee),
        totalTransaction: transactions.length,
      },
      create: {
        date: summaryDate,
        periodType: 'daily',
        totalRevenue: new Prisma.Decimal(totalRevenue),
        totalFee: new Prisma.Decimal(totalFee),
        totalTransaction: transactions.length,
      },
    });

    this.logger.log(
      `✅ RevenueSummary updated for ${summaryDate.toISOString().split('T')[0]}`,
    );
  }
}
