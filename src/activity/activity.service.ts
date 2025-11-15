import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ActivityMetadata = Prisma.InputJsonValue | undefined;

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: number | null,
    action: string,
    metadata?: ActivityMetadata,
  ) {
    return this.prisma.activity.create({
      data: {
        userId,
        action,
        metadata,
      },
    });
  }

  async getUserActivity(userId: number) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getAll() {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
