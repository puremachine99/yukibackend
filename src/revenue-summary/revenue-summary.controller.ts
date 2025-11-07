import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RevenueSummaryService } from './revenue-summary.service';
import { CreateRevenueSummaryDto } from './dto/create-revenue-summary.dto';
import { UpdateRevenueSummaryDto } from './dto/update-revenue-summary.dto';

@Controller('revenue-summary')
export class RevenueSummaryController {
  constructor(private readonly revenueSummaryService: RevenueSummaryService) {}

  @Post()
  create(@Body() createRevenueSummaryDto: CreateRevenueSummaryDto) {
    return this.revenueSummaryService.create(createRevenueSummaryDto);
  }

  @Get()
  findAll() {
    return this.revenueSummaryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.revenueSummaryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRevenueSummaryDto: UpdateRevenueSummaryDto) {
    return this.revenueSummaryService.update(+id, updateRevenueSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.revenueSummaryService.remove(+id);
  }
}
