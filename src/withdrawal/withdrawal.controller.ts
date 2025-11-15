import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ProcessWithdrawalDto } from './dto/process-withdrawal.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.withdrawalService.requestWithdrawal(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.withdrawalService.findAllByUser(user.id);
  }

  // admin
  @Roles('admin')
  @Get('admin')
  adminList(@Query('status') status?: string) {
    return this.withdrawalService.adminListAll(status);
  }

  @Roles('admin')
  @Patch(':id/process')
  process(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.withdrawalService.processWithdrawal(user.id, +id, dto);
  }
}
