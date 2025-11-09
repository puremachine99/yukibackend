import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { CreateAdPlanDto } from './dto/create-ad-plan.dto';
import { UpdateAdPlanDto } from './dto/update-ad-plan.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementStatusDto } from './dto/update-advertisement-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdStatus } from '@prisma/client';

@Controller('ads')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  // --- Public serving ---
  @Public()
  @Get('active')
  getActive(@Query('position') position?: string) {
    return this.advertisementService.getActiveAds(position);
  }

  // --- Ad Plan (Admin) ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('plan')
  createPlan(@Body() dto: CreateAdPlanDto) {
    return this.advertisementService.createPlan(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('plan')
  findPlans() {
    return this.advertisementService.findAllPlans();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('plan/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpdateAdPlanDto) {
    return this.advertisementService.updatePlan(+id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('plan/:id')
  removePlan(@Param('id') id: string) {
    return this.advertisementService.removePlan(+id);
  }

  // --- Seller Flow ---
  @UseGuards(JwtAuthGuard)
  @Post()
  createAd(
    @CurrentUser() user: { id: number },
    @Body() dto: CreateAdvertisementDto,
  ) {
    return this.advertisementService.createAdvertisement(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  myAds(@CurrentUser() user: { id: number }) {
    return this.advertisementService.findByUser(user.id);
  }

  // --- Admin Review ---
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  adminList(@Query('status') status?: AdStatus) {
    return this.advertisementService.adminList(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdvertisementStatusDto,
  ) {
    return this.advertisementService.updateStatus(+id, dto);
  }
}
