import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async toggleWishlist(userId: number, itemId: number) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({ where: { id: existing.id } });
      return { message: 'Removed from wishlist', itemId };
    }

    await this.prisma.wishlist.create({
      data: { userId, itemId },
    });
    return { message: 'Added to wishlist', itemId };
  }

  async getWishlist(userId: number) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: { item: { include: { media: true, owner: true } } },
    });
  }
}
