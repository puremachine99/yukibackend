import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  async toggleWishlist(userId: number, itemId: number) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: { id: true },
    });
    if (!item) throw new NotFoundException('Item not found');

    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      await this.activity.log(userId, 'WISHLIST_REMOVE', { itemId });
      return { message: 'Removed from wishlist', itemId };
    }

    await this.prisma.wishlist.create({
      data: { userId, itemId },
    });

    await this.activity.log(userId, 'WISHLIST_ADD', { itemId });
    return { message: 'Added to wishlist', itemId };
  }

  async getWishlist(userId: number) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { item: { include: { media: true, owner: true } } },
    });
  }
}
