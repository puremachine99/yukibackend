import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuctionModule } from './auction/auction.module';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { BidModule } from './bid/bid.module';
import { ChatModule } from './chat/chat.module';
import { CartModule } from './cart/cart.module';
import { TransactionModule } from './transaction/transaction.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { SellerBalanceModule } from './seller-balance/seller-balance.module';
import { FollowModule } from './follow/follow.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { LikeModule } from './like/like.module';
import { AchievementModule } from './achievement/achievement.module';
import { NotificationModule } from './notification/notification.module';
import { RevenueSummaryModule } from './revenue-summary/revenue-summary.module';
import { ActivityModule } from './activity/activity.module';
import { UserAddressModule } from './user-address/user-address.module';
import { AdminModule } from './admin/admin.module';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { AdPlanModule } from './ad-plan/ad-plan.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    ItemsModule,
    BidModule,
    ChatModule,
    CartModule,
    TransactionModule,
    WithdrawalModule,
    SellerBalanceModule,
    FollowModule,
    WishlistModule,
    LikeModule,
    AchievementModule,
    NotificationModule,
    RevenueSummaryModule,
    ActivityModule,
    AuctionModule,
    UserAddressModule,
    AdminModule,
    AdvertisementModule,
    AdPlanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
