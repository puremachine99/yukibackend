import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayTransactionDto } from './dto/pay-transaction.dto';

@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  findAll(@Req() req) {
    return this.transactionService.findAllByUser(req.user.id);
  }

  @Post(':cartId/pay')
  payTransaction(
    @Req() req,
    @Param('cartId') cartId: string,
    @Body() dto: PayTransactionDto,
  ) {
    return this.transactionService.payTransaction(req.user.id, +cartId, dto);
  }

  @Get('seller/summary')
  getSellerSummary(@Req() req) {
    return this.transactionService.getSellerRevenueSummary(req.user.id);
  }

  @Get('summary/daily')
  async getTodaySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.transactionService.getSummaryByDate(today);
  }
}
