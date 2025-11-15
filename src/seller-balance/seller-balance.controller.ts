import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SellerBalanceService } from './seller-balance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BalanceStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seller-balance')
export class SellerBalanceController {
  constructor(private readonly sellerBalanceService: SellerBalanceService) {}

  @Get('me')
  getMyBalance(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.sellerBalanceService.getSellerSummary(user.id);
  }

  @Get('me/chart')
  getMyChart(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('range') range?: string,
  ) {
    return this.sellerBalanceService.getSellerChart(
      user.id,
      range ? Number(range) : undefined,
    );
  }

  @Roles('admin')
  @Get()
  listBalances(
    @Query('status') status?: BalanceStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const validStatus =
      status && Object.values(BalanceStatus).includes(status)
        ? status
        : undefined;
    return this.sellerBalanceService.list({
      status: validStatus,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Roles('admin')
  @Get('overview')
  getOverview() {
    return this.sellerBalanceService.getOverview();
  }

  @Roles('admin')
  @Get(':sellerId')
  getSellerBalance(@Param('sellerId') sellerId: string) {
    return this.sellerBalanceService.getSellerDetail(+sellerId);
  }

  @Roles('admin')
  @Get(':sellerId/chart')
  getSellerChart(
    @Param('sellerId') sellerId: string,
    @Query('range') range?: string,
  ) {
    return this.sellerBalanceService.getSellerChart(
      +sellerId,
      range ? Number(range) : undefined,
    );
  }
}
