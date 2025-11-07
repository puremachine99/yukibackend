import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuctionsModule } from './auctions/auctions.module';
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
import { MediaModule } from './media/media.module';
import { ItemOnAuctionModule } from './item-on-auction/item-on-auction.module';
import { TagModule } from './tag/tag.module';
import { ItemTagModule } from './item-tag/item-tag.module';
import { TransactionLogModule } from './transaction-log/transaction-log.module';
import { ActivityModule } from './activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    AuctionsModule,
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
    MediaModule,
    ItemOnAuctionModule,
    TagModule,
    ItemTagModule,
    TransactionLogModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
