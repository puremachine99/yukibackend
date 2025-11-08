import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ⬅️ tambahkan ini

@Module({
  imports: [PrismaModule], // ⬅️ tambahkan ini
  controllers: [AuctionController],
  providers: [AuctionService],
})
export class AuctionModule {}
