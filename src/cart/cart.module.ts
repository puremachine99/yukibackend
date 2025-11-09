import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ActivityModule } from '../activity/activity.module';
import { CartExpiryTask } from './cart-expiry.task';

@Module({
  imports: [PrismaModule, NotificationModule, ActivityModule],
  controllers: [CartController],
  providers: [CartService, CartExpiryTask], // ⬅️ tambahkan task di sini
})
export class CartModule {}
