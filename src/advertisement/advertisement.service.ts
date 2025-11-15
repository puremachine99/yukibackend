import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, AdStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdPlanDto } from './dto/create-ad-plan.dto';
import { UpdateAdPlanDto } from './dto/update-ad-plan.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementStatusDto } from './dto/update-advertisement-status.dto';

const DEFAULT_PLANS: CreateAdPlanDto[] = [
  {
    name: 'Homepage Hero Banner',
    description: 'Appears on homepage hero section for maximum visibility',
    price: 500000,
    duration: 7,
    position: 'homepage_hero',
    isActive: true,
  },
  {
    name: 'Auction Sidebar Spotlight',
    description: 'Sidebar placement on live auction pages',
    price: 250000,
    duration: 7,
    position: 'auction_sidebar',
    isActive: true,
  },
];

@Injectable()
export class AdvertisementService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const planCount = await this.prisma.adPlan.count();
    if (planCount === 0) {
      await this.prisma.adPlan.createMany({
        data: DEFAULT_PLANS.map((plan) => ({
          ...plan,
          price: new Prisma.Decimal(plan.price),
        })),
      });
    }
  }

  // --- AdPlan (admin) ---
  createPlan(dto: CreateAdPlanDto) {
    return this.prisma.adPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        duration: dto.duration,
        position: dto.position,
        isActive: dto.isActive ?? true,
      },
    });
  }

  findAllPlans() {
    return this.prisma.adPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  updatePlan(id: number, dto: UpdateAdPlanDto) {
    return this.prisma.adPlan.update({
      where: { id },
      data: {
        ...dto,
        price:
          dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
      },
    });
  }

  removePlan(id: number) {
    return this.prisma.adPlan.delete({ where: { id } });
  }

  // --- Seller Flow ---
  async createAdvertisement(userId: number, dto: CreateAdvertisementDto) {
    const plan = await this.prisma.adPlan.findUnique({
      where: { id: dto.adPlanId, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Ad plan not found or inactive');
    }

    if (dto.transactionId) {
      const transaction = await this.prisma.transaction.findUnique({
        where: { id: dto.transactionId },
      });
      if (!transaction || transaction.buyerId !== userId) {
        throw new ForbiddenException('Invalid transaction reference');
      }
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate =
      startDate && plan.duration
        ? new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000)
        : null;

    return this.prisma.advertisement.create({
      data: {
        userId,
        adPlanId: dto.adPlanId,
        title: dto.title,
        mediaUrl: dto.mediaUrl,
        redirectUrl: dto.redirectUrl,
        startDate,
        endDate,
        note: dto.note,
        status: AdStatus.pending,
        transactionId: dto.transactionId,
      },
    });
  }

  findByUser(userId: number) {
    return this.prisma.advertisement.findMany({
      where: { userId },
      include: { adPlan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- Admin Review ---
  adminList(status?: AdStatus) {
    return this.prisma.advertisement.findMany({
      where: status ? { status } : undefined,
      include: {
        adPlan: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, dto: UpdateAdvertisementStatusDto) {
    const ad = await this.prisma.advertisement.findUnique({
      where: { id },
      include: { adPlan: true },
    });
    if (!ad) throw new NotFoundException('Advertisement not found');

    if (dto.transactionId) {
      const tx = await this.prisma.transaction.findUnique({
        where: { id: dto.transactionId },
      });
      if (!tx || tx.buyerId !== ad.userId) {
        throw new ForbiddenException('Invalid transaction reference');
      }
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : (ad.startDate ?? new Date());

    let endDate = dto.endDate ? new Date(dto.endDate) : ad.endDate;
    if (dto.status === AdStatus.approved || dto.status === AdStatus.active) {
      endDate = new Date(
        (startDate ?? new Date()).getTime() +
          (ad.adPlan.duration || 0) * 24 * 60 * 60 * 1000,
      );
    }

    return this.prisma.advertisement.update({
      where: { id },
      data: {
        status: dto.status,
        note: dto.note,
        startDate: startDate ?? ad.startDate,
        endDate,
        transactionId: dto.transactionId ?? ad.transactionId,
      },
    });
  }

  // --- Serving ---
  getActiveAds(position?: string) {
    const now = new Date();
    return this.prisma.advertisement.findMany({
      where: {
        status: AdStatus.active,
        adPlan: position ? { position } : undefined,
        OR: [
          {
            startDate: null,
          },
          {
            startDate: { lte: now },
          },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              {
                endDate: { gte: now },
              },
            ],
          },
        ],
      },
      include: { adPlan: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
