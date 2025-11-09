import { Module } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { RevenueSummaryController } from './revenue-summary.controller';

@Module({
  controllers: [RevenueSummaryController],
  providers: [RevenueSummaryService],
})
export class RevenueSummaryModule {}
