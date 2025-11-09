import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayCartDto } from './dto/pay-cart.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getUserCart(@Req() req) {
    return this.cartService.getUserCart(req.user.id);
  }

  @Post(':itemOnAuctionId')
  addToCart(@Req() req, @Param('itemOnAuctionId') itemOnAuctionId: string) {
    return this.cartService.addToCart(req.user.id, +itemOnAuctionId);
  }

  @Patch(':id/pay')
  simulatePay(@Req() req, @Param('id') id: string, @Body() dto: PayCartDto) {
    return this.cartService.simulatePayment(req.user.id, +id, dto);
  }
}
