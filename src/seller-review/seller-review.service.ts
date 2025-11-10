import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerReviewDto } from './dto/create-seller-review.dto';
import { NotificationService } from '../notification/notification.service';
import { ActivityService } from '../activity/activity.service';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class SellerReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
    private readonly activity: ActivityService,
  ) {}

  async create(userId: number, dto: CreateSellerReviewDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
      include: { seller: true },
    });
    if (!transaction || transaction.buyerId !== userId) {
      throw new ForbiddenException('Transaction not found');
    }
    if (transaction.status !== TransactionStatus.paid) {
      throw new BadRequestException('Transaction not eligible for review');
    }
    const existing = await this.prisma.sellerReview.findUnique({
      where: { transactionId: dto.transactionId },
    });
    if (existing) {
      throw new BadRequestException('Review already submitted');
    }
    const review = await this.prisma.sellerReview.create({
      data: {
        transactionId: dto.transactionId,
        sellerId: transaction.sellerId,
        buyerId: userId,
        rating: dto.rating,
        shippingScore: dto.shippingScore ?? null,
        comment: dto.comment,
      },
    });
    await this.notification.create(
      transaction.sellerId,
      'seller_review',
      `You received a new review (rating ${dto.rating}/5).`,
      { reviewId: review.id, transactionId: transaction.id },
    );
    await this.activity.log(userId, 'CREATE_SELLER_REVIEW', {
      transactionId: transaction.id,
      reviewId: review.id,
      rating: dto.rating,
    });
    return review;
  }

  async findBySeller(sellerId: number, page = 1, limit = 10) {
    const take = Math.min(100, limit);
    const skip = Math.max(0, (page - 1) * take);
    const [reviews, total, aggregates] = await Promise.all([
      this.prisma.sellerReview.findMany({
        where: { sellerId },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.sellerReview.count({ where: { sellerId } }),
      this.prisma.sellerReview.aggregate({
        where: { sellerId },
        _avg: { rating: true, shippingScore: true },
        _count: { _all: true },
      }),
    ]);
    return {
      meta: {
        total,
        page,
        limit: take,
        pages: Math.ceil(total / take) || 1,
        averageRating: aggregates._avg.rating ?? 0,
        averageShipping: aggregates._avg.shippingScore ?? 0,
      },
      data: reviews,
    };
  }

  async pendingForBuyer(userId: number) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: TransactionStatus.paid,
        sellerReview: null,
      },
      select: {
        id: true,
        sellerId: true,
        seller: { select: { id: true, name: true, avatar: true } },
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return transactions;
  }
}

