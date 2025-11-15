import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { addSeconds, addDays } from 'date-fns';

@Injectable()
export class BidService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly activity: ActivityService,
  ) {}

  async create(userId: number, dto: CreateBidDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Bid amount must be greater than zero');
    }

    const itemOnAuction = await this.prisma.itemOnAuction.findUnique({
      where: { id: dto.itemOnAuctionId },
      include: {
        auction: true,
        item: true,
        bids: { orderBy: { amount: 'desc' }, take: 1 },
      },
    });

    if (!itemOnAuction)
      throw new NotFoundException('Item on auction not found');
    if (itemOnAuction.item.ownerId === userId) {
      throw new ForbiddenException('You cannot bid on your own item');
    }
    if (itemOnAuction.status !== 'active') {
      throw new BadRequestException('This item is not accepting bids');
    }
    if (itemOnAuction.item.isSold) {
      throw new BadRequestException('Item already sold');
    }

    const now = new Date();
    const auction = itemOnAuction.auction;
    const auctionEnd = addSeconds(auction.endTime, auction.extraTime || 0);
    if (
      auction.status !== 'active' ||
      auction.startTime > now ||
      auctionEnd < now
    ) {
      throw new BadRequestException('Auction is not active');
    }

    const isBuyNow = dto.isBuyNow === true;
    const buyNowPrice = Number(itemOnAuction.item.buyItNow?.toString() || '0');

    if (isBuyNow) {
      if (!buyNowPrice) {
        // kalau belum diset harga BuyNow, anggap fitur BuyNow tidak aktif
        // fallback: ubah jadi bid biasa biar gak gagal
        dto.isBuyNow = false;
      } else if (dto.amount < buyNowPrice) {
        throw new BadRequestException(
          `Buy Now requires at least ${buyNowPrice.toFixed(2)}`,
        );
      }
    }

    const highestBid = itemOnAuction.bids[0];
    const startingBid = Number(
      itemOnAuction.item.startingBid?.toString() || '0',
    );
    const increment = Number(
      itemOnAuction.item.bidIncrement?.toString() || '0',
    );
    const minRequired = highestBid
      ? Number(highestBid.amount.toString()) + increment
      : startingBid;

    // ✅ Normal bid validation (skip if BuyNow)
    if (!isBuyNow && dto.amount < minRequired) {
      throw new BadRequestException(
        `Bid must be at least ${minRequired.toFixed(2)}`,
      );
    }

    // create bid record
    const bid = await this.prisma.bid.create({
      data: {
        userId,
        itemOnAuctionId: dto.itemOnAuctionId,
        amount: dto.amount,
        isBuyNow,
      },
    });

    // notify seller for new bid
    if (auction?.userId && auction.userId !== userId && !isBuyNow) {
      await this.notification.create(
        auction.userId,
        'bid',
        `Your item "${itemOnAuction.item.name}" just received a new bid.`,
        { bidId: bid.id, itemId: itemOnAuction.item.id },
      );
    }

    // log bid activity
    await this.activity.log(userId, isBuyNow ? 'BUY_NOW' : 'PLACE_BID', {
      itemId: itemOnAuction.item.id,
      auctionId: auction.id,
      amount: dto.amount,
    });

    // ✅ Handle BuyNow flow
    if (isBuyNow) {
      await this.prisma.$transaction([
        this.prisma.item.update({
          where: { id: itemOnAuction.item.id },
          data: { isSold: true },
        }),
        this.prisma.itemOnAuction.update({
          where: { id: itemOnAuction.id },
          data: { status: 'sold' },
        }),
        this.prisma.cart.create({
          data: {
            buyerId: userId,
            itemOnAuctionId: itemOnAuction.id,
            price: dto.amount,
            expiresAt: addDays(new Date(), 3),
          },
        }),
      ]);

      if (auction?.userId) {
        await this.notification.create(
          auction.userId,
          'item_sold',
          `Your item "${itemOnAuction.item.name}" was bought instantly.`,
          { auctionId: auction.id, itemId: itemOnAuction.item.id },
        );
      }
    }

    return bid;
  }

  async findAll(userId: number) {
    return this.prisma.bid.findMany({
      where: { userId },
      include: {
        itemOnAuction: {
          include: { auction: true, item: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const bid = await this.prisma.bid.findFirst({
      where: { id, userId },
      include: {
        itemOnAuction: { include: { auction: true, item: true } },
      },
    });
    if (!bid) throw new NotFoundException('Bid not found');
    return bid;
  }

  async update(id: number, userId: number, dto: UpdateBidDto) {
    return this.prisma.bid.updateMany({
      where: { id, userId },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    return this.prisma.bid.deleteMany({
      where: { id, userId },
    });
  }
}
