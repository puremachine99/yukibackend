import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';

@Injectable()
export class AuctionService {
  constructor(private prisma: PrismaService) {}

  // 🔒 Private CRUD

  create(userId: number, dto: CreateAuctionDto) {
    return this.prisma.auction.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        status: 'draft',
      },
    });
  }

  findAll(user: User) {
    return this.prisma.auction.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: number, user: User, dto: UpdateAuctionDto) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== user.id)
      throw new ForbiddenException('You are not the owner');

    return this.prisma.auction.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, user: User) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.userId !== user.id)
      throw new ForbiddenException('You are not the owner');

    return this.prisma.auction.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'cancelled' },
    });
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
        status: 'active',
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
