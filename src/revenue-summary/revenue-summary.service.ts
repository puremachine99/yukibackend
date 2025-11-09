import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface ListParams {
  periodType?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class RevenueSummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListParams) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 30));
    const where = params.periodType ? { periodType: params.periodType } : undefined;

    const [data, total] = await Promise.all([
      this.prisma.revenueSummary.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.revenueSummary.count({ where }),
    ]);

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
      data: data.map((entry) => this.serialize(entry)),
    };
  }

  async findOne(id: number) {
    const summary = await this.prisma.revenueSummary.findUnique({ where: { id } });
    if (!summary) throw new NotFoundException('Revenue summary not found');
    return this.serialize(summary);
  }

  async getOverview() {
    const [aggregate, latest] = await Promise.all([
      this.prisma.revenueSummary.aggregate({
        _sum: {
          totalRevenue: true,
          totalFee: true,
          totalTransaction: true,
          totalWithdrawal: true,
        },
        _count: { _all: true },
      }),
      this.prisma.revenueSummary.findMany({
        orderBy: { date: 'desc' },
        take: 7,
      }),
    ]);

    return {
      totals: {
        records: aggregate._count._all,
        revenue: this.decimalToNumber(aggregate._sum.totalRevenue),
        fee: this.decimalToNumber(aggregate._sum.totalFee),
        transactions: aggregate._sum.totalTransaction ?? 0,
        withdrawals: aggregate._sum.totalWithdrawal ?? 0,
      },
      recent: latest.map((entry) => this.serialize(entry)),
    };
  }

  async getChart(rangeDays = 14) {
    const range = Math.max(1, Math.min(rangeDays, 90));
    const start = new Date();
    start.setDate(start.getDate() - (range - 1));
    start.setHours(0, 0, 0, 0);

    const summaries = await this.prisma.revenueSummary.findMany({
      where: { date: { gte: start } },
      orderBy: { date: 'asc' },
    });

    type SummaryPoint = ReturnType<typeof this.serialize>;
    const buckets = new Map<string, SummaryPoint>();
    for (const entry of summaries) {
      const serialized = this.serialize(entry);
      buckets.set(serialized.date, serialized);
    }

    const series: SummaryPoint[] = [];
    for (let i = 0; i < range; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().split('T')[0];
      const bucket = buckets.get(key) ?? {
        id: 0,
        date: key,
        totalRevenue: 0,
        totalFee: 0,
        totalTransaction: 0,
        totalWithdrawal: 0,
        periodType: 'daily',
        createdAt: date,
      };
      series.push(bucket);
    }

    return series;
  }

  private serialize(entry: any) {
    return {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0],
      periodType: entry.periodType,
      totalRevenue: this.decimalToNumber(entry.totalRevenue),
      totalFee: this.decimalToNumber(entry.totalFee),
      totalTransaction: entry.totalTransaction,
      totalWithdrawal: entry.totalWithdrawal,
      createdAt: entry.createdAt,
    };
  }

  private decimalToNumber(value?: Prisma.Decimal | number | null) {
    if (value === null || value === undefined) return 0;
    return value instanceof Prisma.Decimal ? Number(value) : value;
  }
}
