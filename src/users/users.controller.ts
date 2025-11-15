import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getOwnProfile(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  async updateOwnProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, dto);
  }

  @Public()
  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid ID parameter');
    }
    return this.usersService.findPublicProfile(numericId);
  }
}
