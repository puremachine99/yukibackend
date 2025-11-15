import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Public()
  @Get('auction/:auctionId')
  findByAuction(@Param('auctionId') auctionId: string) {
    return this.chatService.findByAuction(+auctionId);
  }

  @Post('auction/:auctionId')
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('auctionId') auctionId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(user.id, +auctionId, createChatDto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.chatService.remove(+id, user.id);
  }
}
