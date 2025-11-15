import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':itemId')
  async toggleLike(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('itemId') itemId: string,
  ) {
    return this.likeService.toggleLike(user.id, +itemId);
  }

  @Get()
  async getLikedItems(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.likeService.getLikedItems(user.id);
  }
}
