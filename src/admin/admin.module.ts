import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WithdrawalModule } from '../withdrawal/withdrawal.module';
import { TransactionModule } from '../transaction/transaction.module';
import { UsersModule } from '../users/users.module'; // Pastikan nama module sesuai folder kamu

@Module({
  imports: [PrismaModule, WithdrawalModule, TransactionModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
