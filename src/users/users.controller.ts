import {
  Controller,
  Get,
  Req,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getOwnProfile(@Req() req) {
    console.log('req.user:', req.user);
    if (!req.user?.id) throw new Error('Unauthorized or invalid token');
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async updateOwnProfile(@Req() req, @Body() dto: UpdateUserDto) {
    if (!req.user?.id) throw new Error('Unauthorized');
    return this.usersService.update(req.user.id, dto);
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
