import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { AuctionSchedulerTask } from './auction-scheduler.task';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionSchedulerTask],
})
export class AuctionModule {}
