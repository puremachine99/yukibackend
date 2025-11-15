import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SellerReviewService } from './seller-review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateSellerReviewDto } from './dto/create-seller-review.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('seller-review')
export class SellerReviewController {
  constructor(private readonly sellerReviewService: SellerReviewService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateSellerReviewDto,
  ) {
    return this.sellerReviewService.create(user.id, dto);
  }

  @Get('pending')
  pending(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.sellerReviewService.pendingForBuyer(user.id);
  }

  @Public()
  @Get('seller/:sellerId')
  listBySeller(
    @Param('sellerId') sellerId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sellerReviewService.findBySeller(
      +sellerId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
    );
  }
}
