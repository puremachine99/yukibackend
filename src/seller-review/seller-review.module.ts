import { Module } from '@nestjs/common';
import { SellerReviewService } from './seller-review.service';
import { SellerReviewController } from './seller-review.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, NotificationModule, ActivityModule],
  controllers: [SellerReviewController],
  providers: [SellerReviewService],
  exports: [SellerReviewService],
})
export class SellerReviewModule {}
