import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Patch('users/:id/ban')
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(+id);
  }

  @Get('withdrawals/pending')
  async getPendingWithdrawals() {
    return this.adminService.getPendingWithdrawals();
  }

  @Get('revenue-summary')
  async getRevenueSummary() {
    return this.adminService.getRevenueSummary();
  }
}
