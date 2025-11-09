import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdPlanService } from './ad-plan.service';
import { CreateAdPlanDto } from './dto/create-ad-plan.dto';
import { UpdateAdPlanDto } from './dto/update-ad-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('ad-plan')
export class AdPlanController {
  constructor(private readonly adPlanService: AdPlanService) {}

  @Post()
  create(@Body() dto: CreateAdPlanDto) {
    return this.adPlanService.create(dto);
  }

  @Get()
  findAll() {
    return this.adPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adPlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdPlanDto) {
    return this.adPlanService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adPlanService.remove(+id);
  }
}
