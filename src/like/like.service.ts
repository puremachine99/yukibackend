import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  async toggleLike(userId: number, itemId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true, name: true, ownerId: true },
    });
    if (!item) throw new NotFoundException('Item not found');

    const existing = await this.prisma.like.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.activity.log(userId, 'UNLIKE_ITEM', { itemId });
      return { message: 'Unliked', itemId };
    }

    if (item.ownerId === userId) {
      throw new ForbiddenException('You cannot like your own item');
    }

    await this.prisma.like.create({
      data: { userId, itemId },
    });

    if (item.ownerId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      await this.notification.create(
        item.ownerId,
        'item_like',
        `${liker?.name || 'Someone'} liked your item "${item.name}".`,
        { itemId: item.id, likerId: userId },
      );
    }

    await this.activity.log(userId, 'LIKE_ITEM', { itemId });
    return { message: 'Liked', itemId };
  }

  async getLikedItems(userId: number) {
    return this.prisma.like.findMany({
      where: { userId },
      include: { item: { include: { media: true, owner: true } } },
    });
  }
}
