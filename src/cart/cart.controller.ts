import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayCartDto } from './dto/pay-cart.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getUserCart(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.cartService.getUserCart(user.id);
  }

  @Post(':itemOnAuctionId')
  addToCart(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('itemOnAuctionId') itemOnAuctionId: string,
  ) {
    return this.cartService.addToCart(user.id, +itemOnAuctionId);
  }

  @Patch(':id/pay')
  simulatePay(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: PayCartDto,
  ) {
    return this.cartService.simulatePayment(user.id, +id, dto);
  }
}
