import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ActivityModule } from 'src/activity/activity.module';

@Module({
  imports: [PrismaModule, NotificationModule, ActivityModule],
  controllers: [BidController],
  providers: [BidService],
})
export class BidModule {}
