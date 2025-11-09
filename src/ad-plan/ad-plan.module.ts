import { Module } from '@nestjs/common';
import { AdPlanService } from './ad-plan.service';
import { AdPlanController } from './ad-plan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdPlanController],
  providers: [AdPlanService],
})
export class AdPlanModule {}
