import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.transactionService.findAllByUser(user.id);
  }

  @Post(':cartId/pay')
  payTransaction(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('cartId') cartId: string,
    @Body() dto: PayTransactionDto,
  ) {
    return this.transactionService.payTransaction(user.id, +cartId, dto);
  }

  @Get('seller/summary')
  getSellerSummary(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.transactionService.getSellerRevenueSummary(user.id);
  }

  @Get('summary/daily')
  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.transactionService.getSummaryByDate(today);
  }
}
