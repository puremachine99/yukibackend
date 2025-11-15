import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { AuctionStatus, Prisma } from '@prisma/client';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@Injectable()
export class AuctionService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}

  private serializeMetadata(data: Record<string, unknown>): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(data));
  }

  // 🔒 Private CRUD

  async create(userId: number, dto: CreateAuctionDto) {
    const auction = await this.prisma.auction.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: AuctionStatus.draft,
      },
    });

    await this.activity.log(userId, 'CREATE_AUCTION', {
      auctionId: auction.id,
      title: auction.title,
      startTime: auction.startTime,
      endTime: auction.endTime,
    });

    return auction;
  }

  findAll(userId: number) {
    return this.prisma.auction.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, userId: number, dto: UpdateAuctionDto) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== userId)
      throw new ForbiddenException('You are not the owner');

    const updatedAuction = await this.prisma.auction.update({
      where: { id },
      data: dto,
    });

    await this.activity.log(
      userId,
      'UPDATE_AUCTION',
      this.serializeMetadata({
        auctionId: updatedAuction.id,
        changes: { ...dto },
      }),
    );

    return updatedAuction;
  }

  async remove(id: number, userId: number) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== userId)
      throw new ForbiddenException('You are not the owner');

    const deletedAuction = await this.prisma.auction.update({
      where: { id },
      data: { deletedAt: new Date(), status: AuctionStatus.cancelled },
    });

    await this.activity.log(userId, 'DELETE_AUCTION', {
      auctionId: deletedAuction.id,
    });

    return deletedAuction;
  }

  // 🔓 Public logic

  async findPublic() {
    return this.prisma.auction.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        items: {
          include: { item: { include: { media: true } } },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findActiveAuctions() {
    const now = new Date();
    return this.prisma.auction.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gte: now },
        status: AuctionStatus.active,
        deletedAt: null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        items: {
          include: { item: { include: { media: true } } },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findDetail(id: number) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        items: {
          include: {
            item: {
              include: {
                media: true,
                owner: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }
}
