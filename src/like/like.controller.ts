import { Controller, Post, Get, Param, Req, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post(':itemId')
  async toggleLike(@Req() req, @Param('itemId') itemId: string) {
    return this.likeService.toggleLike(req.user.id, +itemId);
  }

  @Get()
  async getLikedItems(@Req() req) {
    return this.likeService.getLikedItems(req.user.id);
  }
}
