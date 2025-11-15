import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  async create(userId: number, auctionId: number, dto: CreateChatDto) {
    const itemOnAuction = await this.prisma.itemOnAuction.findFirst({
      where: { id: dto.itemOnAuctionId, auctionId },
      include: { auction: true },
    });

    if (!itemOnAuction) {
      throw new NotFoundException('Item not found in this auction');
    }

    if (dto.parentId) {
      const parent = await this.prisma.chat.findUnique({
        where: { id: dto.parentId },
        include: { itemOnAuction: true },
      });
      if (!parent || parent.itemOnAuctionId !== dto.itemOnAuctionId) {
        throw new ForbiddenException(
          'Reply must reference the same auction thread',
        );
      }
    }

    const chat = await this.prisma.chat.create({
      data: {
        userId,
        itemOnAuctionId: dto.itemOnAuctionId,
        message: dto.message,
        parentId: dto.parentId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    await this.activity.log(userId, 'CHAT_SENT', {
      chatId: chat.id,
      auctionId,
      itemOnAuctionId: dto.itemOnAuctionId,
    });

    return chat;
  }

  async findByAuction(auctionId: number) {
    return this.prisma.chat.findMany({
      where: { itemOnAuction: { auctionId }, isDeleted: false },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          where: { isDeleted: false },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async remove(id: number, userId: number) {
    const chat = await this.prisma.chat.findUnique({ where: { id } });
    if (!chat) throw new NotFoundException('Chat not found');
    if (chat.userId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    return this.prisma.chat.update({
      where: { id },
      data: { isDeleted: true, message: '[deleted]' },
    });
  }
}
