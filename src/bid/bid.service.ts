import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';

@Injectable()
export class BidService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, dto: CreateBidDto) {
    return this.prisma.bid.create({
      data: {
        userId,
        itemOnAuctionId: dto.itemOnAuctionId,
        amount: dto.amount,
      },
    });
  }

  findAll(user: User) {
    return this.prisma.bid.findMany({
      where: { userId: user.id },
      include: { itemOnAuction: true },
    });
  }

  findOne(id: number, user: User) {
    return this.prisma.bid.findFirst({
      where: { id, userId: user.id },
      include: { itemOnAuction: true },
    });
  }

  update(id: number, user: User, dto: UpdateBidDto) {
    return this.prisma.bid.updateMany({
      where: { id, userId: user.id },
      data: dto,
    });
  }

  remove(id: number, user: User) {
    return this.prisma.bid.deleteMany({
      where: { id, userId: user.id },
    });
  }
}
