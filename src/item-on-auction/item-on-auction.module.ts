import { Module } from '@nestjs/common';
import { ItemOnAuctionService } from './item-on-auction.service';

@Module({
  providers: [ItemOnAuctionService]
})
export class ItemOnAuctionModule {}
