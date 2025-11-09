import { Module } from '@nestjs/common';
import { SellerBalanceService } from './seller-balance.service';
import { SellerBalanceController } from './seller-balance.controller';

@Module({
  controllers: [SellerBalanceController],
  providers: [SellerBalanceService],
})
export class SellerBalanceModule {}
