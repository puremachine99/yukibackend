import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':itemId')
  async toggleWishlist(@Req() req, @Param('itemId') itemId: string) {
    return this.wishlistService.toggleWishlist(req.user.id, +itemId);
  }

  @Get()
  async getWishlist(@Req() req) {
    return this.wishlistService.getWishlist(req.user.id);
  }
}
