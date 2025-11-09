import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('revenue-summary')
export class RevenueSummaryController {
  constructor(private readonly revenueSummaryService: RevenueSummaryService) {}

  @Get()
  list(
    @Query('periodType') periodType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.revenueSummaryService.list({
      periodType,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('overview')
  overview() {
    return this.revenueSummaryService.getOverview();
  }

  @Get('chart')
  chart(@Query('range') range?: string) {
    return this.revenueSummaryService.getChart(range ? Number(range) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.revenueSummaryService.findOne(+id);
  }
}
