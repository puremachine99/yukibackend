import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type NotificationData = Prisma.InputJsonValue | undefined;

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: number,
    type: string,
    message: string,
    data?: NotificationData,
  ) {
    return this.prisma.notification.create({
      data: { userId, type, message, data },
    });
  }

  async markAsRead(id: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async findUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
