import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private activity: ActivityService,
  ) {}
  async create(ownerId: number, dto: CreateItemDto) {
    const { media: _media, ...itemData } = dto;

    const item = await this.prisma.item.create({
      data: {
        ...itemData,
        ownerId,
        media: _media
          ? {
              create: _media.map((m) => ({
                url: m.url,
                type: m.type,
              })),
            }
          : undefined,
      },
      include: { media: true },
    });

    await this.activity.log(ownerId, 'CREATE_ITEM', {
      itemId: item.id,
      name: item.name,
    });

    return item;
  }

  async findAll(filters: {
    ownerId?: number;
    category?: string;
    isSold?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { ownerId, category, isSold, page = 1, limit = 10 } = filters;

    return this.prisma.item.findMany({
      where: {
        deletedAt: null,
        ...(ownerId && { ownerId }),
        ...(category && { category }),
        ...(typeof isSold === 'boolean' && { isSold }),
      },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        media: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        media: true,
      },
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async uploadMedia(itemId: number, userId: number, dto: CreateMediaDto) {
    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');
    if (item.ownerId !== userId)
      throw new ForbiddenException('You are not the owner of this item');

    return this.prisma.media.create({
      data: {
        itemId,
        url: dto.url,
        type: dto.type,
      },
    });
  }

  async getMedia(itemId: number) {
    return this.prisma.media.findMany({
      where: { itemId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: number, userId: number, dto: UpdateItemDto) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (item.ownerId !== userId)
      throw new ForbiddenException('You are not the owner');

    const { media, ...itemData } = dto;

    const updated = await this.prisma.item.update({
      where: { id },
      data: itemData,
    });

    await this.activity.log(userId, 'UPDATE_ITEM', {
      itemId: id,
      fields: Object.keys(dto),
    });

    return updated;
  }

  async remove(id: number, userId: number) {
    const item = await this.prisma.item.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Item not found');
    if (item.ownerId !== userId)
      throw new ForbiddenException('You are not the owner');

    return this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
