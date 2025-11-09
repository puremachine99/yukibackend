import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

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
    @Req() req,
    @Param('auctionId') auctionId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create(req.user.id, +auctionId, createChatDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.chatService.remove(+id, req.user.id);
  }
}
