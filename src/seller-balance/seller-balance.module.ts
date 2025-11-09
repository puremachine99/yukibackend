import { Module } from '@nestjs/common';
import { SellerBalanceService } from './seller-balance.service';
import { SellerBalanceController } from './seller-balance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SellerBalanceController],
  providers: [SellerBalanceService],
})
export class SellerBalanceModule {}
