import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProcessWithdrawalDto } from '../withdrawal/dto/process-withdrawal.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get('users/:id')
  async getUserOverview(@Param('id') id: string) {
    return this.adminService.getUserOverview(+id);
  }

  @Patch('users/:id/ban')
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(+id);
  }

  @Patch('users/:id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(+id);
  }

  @Get('auctions')
  async getAuctions(@Query('status') status?: string) {
    return this.adminService.getAuctions(status);
  }

  @Patch('auctions/:id/approve')
  async approveAuction(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.adminService.approveAuction(+id, user.id);
  }

  @Patch('auctions/:id/reject')
  async rejectAuction(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.adminService.rejectAuction(+id, user.id);
  }

  @Patch('auctions/:id/report')
  async reportAuction(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.adminService.reportAuction(+id, user.id);
  }

  @Get('withdrawals')
  async getWithdrawals(@Query('status') status?: string) {
    const normalized =
      status &&
      Object.values(WithdrawalStatus).includes(status as WithdrawalStatus)
        ? (status as WithdrawalStatus)
        : undefined;
    return this.adminService.getWithdrawals(normalized);
  }

  @Get('withdrawals/pending')
  async getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/process')
  async processWithdrawal(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.adminService.processWithdrawal(user.id, +id, dto);
  }

  @Get('revenue-summary')
  async getRevenueSummary() {
    return this.adminService.getRevenueSummary();
  }
}
