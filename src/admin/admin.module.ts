import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UsersModule } from '../users/users.module'; // Pastikan nama module sesuai folder kamu
import { NotificationModule } from '../notification/notification.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    PrismaModule,
    WithdrawalModule,
    TransactionModule,
    UsersModule,
    NotificationModule,
    ActivityModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
