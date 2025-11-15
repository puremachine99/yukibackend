import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':itemId')
  async toggleWishlist(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('itemId') itemId: string,
  ) {
    return this.wishlistService.toggleWishlist(user.id, +itemId);
  }

  @Get()
  async getWishlist(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.wishlistService.getWishlist(user.id);
  }
}
