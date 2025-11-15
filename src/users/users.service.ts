import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findPublicProfile(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        city: true,
        bio: true,
        avatar: true,
        banner: true,
        reputation: true,
        _count: {
          select: {
            followers: true,
            following: true,
            items: true,
            auctions: true,
          },
        },
        items: {
          where: { isSold: false },
          include: { media: true },
        },
        auctions: {
          select: { id: true, title: true, status: true, startTime: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        city: true,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        bio: true,
        city: true,
        avatar: true,
        banner: true,
      },
    });
  }
}
