import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProcessWithdrawalDto } from '../withdrawal/dto/process-withdrawal.dto';

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
  async approveAuction(@Param('id') id: string, @Req() req) {
    return this.adminService.approveAuction(+id, req.user.id);
  }

  @Patch('auctions/:id/reject')
  async rejectAuction(@Param('id') id: string, @Req() req) {
    return this.adminService.rejectAuction(+id, req.user.id);
  }

  @Patch('auctions/:id/report')
  async reportAuction(@Param('id') id: string, @Req() req) {
    return this.adminService.reportAuction(+id, req.user.id);
  }

  @Get('withdrawals')
  async getWithdrawals(@Query('status') status?: string) {
    return this.adminService.getWithdrawals(status);
  }

  @Get('withdrawals/pending')
  async getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Patch('withdrawals/:id/process')
  async processWithdrawal(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.adminService.processWithdrawal(req.user.id, +id, dto);
  }

  @Get('revenue-summary')
  async getRevenueSummary() {
    return this.adminService.getRevenueSummary();
  }
}
