import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdPlanDto } from './dto/create-ad-plan.dto';
import { UpdateAdPlanDto } from './dto/update-ad-plan.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdPlanService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAdPlanDto) {
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

  findAll() {
    return this.prisma.adPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.adPlan.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateAdPlanDto) {
    return this.prisma.adPlan.update({
      where: { id },
      data: {
        ...dto,
        price:
          dto.price !== undefined ? new Prisma.Decimal(dto.price) : undefined,
      },
    });
  }

  remove(id: number) {
    return this.prisma.adPlan.delete({ where: { id } });
  }
}
