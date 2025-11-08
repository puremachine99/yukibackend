import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async toggleLike(userId: number, itemId: number) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { message: 'Unliked', itemId };
    }

    await this.prisma.like.create({
      data: { userId, itemId },
    });
    return { message: 'Liked', itemId };
  }

  async getLikedItems(userId: number) {
    return this.prisma.like.findMany({
      where: { userId },
      include: { item: { include: { media: true, owner: true } } },
    });
  }
}
