import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ProcessWithdrawalDto } from './dto/process-withdrawal.dto';
import { Prisma, WithdrawalStatus } from '@prisma/client';

@Injectable()
export class WithdrawalService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  async requestWithdrawal(userId: number, dto: CreateWithdrawalDto) {
    const balance = await this.prisma.sellerBalance.findUnique({
      where: { sellerId: userId },
    });

    if (!balance || Number(balance.netBalance) < dto.amount) {
      throw new ForbiddenException('Insufficient balance');
    }

    // kurangi balance seller
    await this.prisma.sellerBalance.update({
      where: { sellerId: userId },
      data: {
        netBalance: new Prisma.Decimal(Number(balance.netBalance) - dto.amount),
      },
    });

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        sellerId: userId,
        amount: dto.amount,
        status: WithdrawalStatus.pending,
      },
    });

    await this.notification.create(
      userId,
      'withdrawal_request',
      `Withdrawal request for Rp${dto.amount.toLocaleString()} submitted.`,
      { withdrawalId: withdrawal.id },
    );

    await this.activity.log(userId, 'WITHDRAWAL_REQUEST', {
      withdrawalId: withdrawal.id,
      amount: dto.amount,
    });

    return withdrawal;
  }

  async findAllByUser(userId: number) {
    return this.prisma.withdrawal.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // admin approval flow
  async processWithdrawal(
    adminId: number,
    id: number,
    dto: ProcessWithdrawalDto,
  ) {
    const withdrawal = await this.prisma.withdrawal.findUnique({
      where: { id },
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    const updated = await this.prisma.withdrawal.update({
      where: { id },
      data: {
        status: dto.status,
        processedBy: adminId,
        payoutReference: dto.payoutReference,
        payoutReceipt: dto.payoutReceipt,
        updatedAt: new Date(),
      },
    });

    // update daily revenue summary (only today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await this.prisma.revenueSummary.upsert({
      where: { date: today },
      update: { totalWithdrawal: { increment: 1 } },
      create: {
        date: today,
        periodType: 'daily',
        totalRevenue: new Prisma.Decimal(0),
        totalFee: new Prisma.Decimal(0),
        totalTransaction: 0,
        totalWithdrawal: 1,
      },
    });

    await this.notification.create(
      withdrawal.sellerId,
      'withdrawal_status',
      `Your withdrawal #${withdrawal.id} is now ${dto.status}`,
      { withdrawalId: withdrawal.id },
    );

    await this.activity.log(adminId, 'PROCESS_WITHDRAWAL', {
      withdrawalId: withdrawal.id,
      status: dto.status,
    });

    return updated;
  }

  async adminListAll(status?: string) {
    const validStatuses: WithdrawalStatus[] = [
      WithdrawalStatus.pending,
      WithdrawalStatus.approved,
      WithdrawalStatus.rejected,
      WithdrawalStatus.paid,
    ]; // samain kayak enum di scheme ya cok

    const where = validStatuses.includes(status as WithdrawalStatus)
      ? { status: status as WithdrawalStatus }
      : undefined;

    return this.prisma.withdrawal.findMany({
      where,
      include: { seller: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
