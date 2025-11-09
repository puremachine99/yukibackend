import { Module } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { RevenueSummaryController } from './revenue-summary.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RevenueSummaryController],
  providers: [RevenueSummaryService],
})
export class RevenueSummaryModule {}
