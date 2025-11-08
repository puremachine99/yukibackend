import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class BidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly activity: ActivityService,
  ) {}

  async create(userId: number, dto: CreateBidDto) {
    const bid = await this.prisma.bid.create({
      data: {
        userId,
        itemOnAuctionId: dto.itemOnAuctionId,
        amount: dto.amount,
      },
    });

    // cari pemilik item
    const item = await this.prisma.itemOnAuction.findUnique({
      where: { id: dto.itemOnAuctionId },
      include: { auction: { include: { user: true } }, item: true },
    });

    // kirim notifikasi ke pemilik item
    if (item?.auction?.userId && item.auction.userId !== userId) {
      await this.notification.create(
        item.auction.userId,
        'bid',
        `Your item "${item.item.name}" just received a new bid.`,
        { bidId: bid.id, itemId: item.item.id },
      );
    }

    // log aktivitas bidder
    await this.activity.log(userId, 'PLACE_BID', {
      itemId: item?.item.id,
      auctionId: item?.auction.id,
      amount: dto.amount,
    });

    return bid;
  }

  findAll(user: User) {
    return this.prisma.bid.findMany({
      where: { userId: user.id },
      include: {
        itemOnAuction: {
          include: { auction: true, item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number, user: User) {
    return this.prisma.bid.findFirst({
      where: { id, userId: user.id },
      include: {
        itemOnAuction: {
          include: { auction: true, item: true },
        },
      },
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
