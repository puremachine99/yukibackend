import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { ActivityService } from 'src/activity/activity.service';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
    private activity: ActivityService,
  ) {}

  async toggleFollow(userId: number, targetId: number) {
    if (userId === targetId)
      throw new ForbiddenException('You cannot follow yourself');

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: targetId },
      },
    });

    if (existing) {
      await this.prisma.follow.delete({
        where: { id: existing.id },
      });
      return { message: 'Unfollowed', followingId: targetId };
    }

    await this.prisma.follow.create({
      data: { followerId: userId, followingId: targetId },
    });
    const follower = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const followerName = follower?.name || 'Someone';
    await this.notification.create(
      targetId,
      'follow',
      `${followerName} started following you.`,
      { followerId: userId },
    );

    await this.activity.log(userId, 'FOLLOW_USER', { targetId });
    return { message: 'Followed', followingId: targetId };
  }

  async getFollowers(userId: number) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async getFollowing(userId: number) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, name: true, avatar: true } },
      },
    });
  }
}
