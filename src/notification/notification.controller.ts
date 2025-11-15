import { Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async getUserNotifications(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.findUserNotifications(user.id);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.service.markAsRead(+id, user.id);
  }

  @Patch(':id/read')
  async patchRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.service.markAsRead(+id, user.id);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.service.markAllAsRead(user.id);
  }
}
