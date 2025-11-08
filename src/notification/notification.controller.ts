import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async getUserNotifications(@Req() req) {
    return this.service.findUserNotifications(req.user.id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.service.markAsRead(+id, req.user.id);
  }

  @Post('read-all')
  async markAllAsRead(@Req() req) {
    return this.service.markAllAsRead(req.user.id);
  }
}
