import { Controller, Post, Param, Get, UseGuards } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // follow or unfollow user
  @Post(':targetId')
  async toggleFollow(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('targetId') targetId: string,
  ) {
    return this.followService.toggleFollow(user.id, +targetId);
  }

  // lihat siapa yang mengikuti saya
  @Get('followers')
  async getFollowers(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.followService.getFollowers(user.id);
  }

  // lihat siapa yang saya ikuti
  @Get('following')
  async getFollowing(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.followService.getFollowing(user.id);
  }
}
