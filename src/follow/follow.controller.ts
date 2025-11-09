import {
  Controller,
  Post,
  Param,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // follow or unfollow user
  @Post(':targetId')
  async toggleFollow(@Req() req, @Param('targetId') targetId: string) {
    return this.followService.toggleFollow(req.user.id, +targetId);
  }

  // lihat siapa yang mengikuti saya
  @Get('followers')
  async getFollowers(@Req() req) {
    return this.followService.getFollowers(req.user.id);
  }

  // lihat siapa yang saya ikuti
  @Get('following')
  async getFollowing(@Req() req) {
    return this.followService.getFollowing(req.user.id);
  }
}
