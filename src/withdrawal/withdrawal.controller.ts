import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { ProcessWithdrawalDto } from './dto/process-withdrawal.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('withdrawal')
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateWithdrawalDto) {
    return this.withdrawalService.requestWithdrawal(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.withdrawalService.findAllByUser(req.user.id);
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
    @Req() req,
    @Param('id') id: string,
    @Body() dto: ProcessWithdrawalDto,
  ) {
    return this.withdrawalService.processWithdrawal(req.user.id, +id, dto);
  }
}
