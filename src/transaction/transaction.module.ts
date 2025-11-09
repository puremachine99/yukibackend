import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ActivityModule } from '../activity/activity.module';
import { RevenueSummaryTask } from './revenue-summary.task';

@Module({
  imports: [PrismaModule, NotificationModule, ActivityModule],
  controllers: [TransactionController],
  providers: [TransactionService, RevenueSummaryTask],
})
export class TransactionModule {}
