import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('auction')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  // 🔓 PUBLIC ROUTES

  @Public()
  @Get()
  getAllPublicAuctions() {
    return this.auctionService.findPublic();
  }

  @Public()
  @Get('live')
  getLiveAuctions() {
    return this.auctionService.findActiveAuctions();
  }

  // 🔒 PRIVATE ROUTES

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: CreateAuctionDto,
  ) {
    return this.auctionService.create(user.id, dto);
  }

  @Get('me')
  findAll(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.auctionService.findAll(user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateAuctionDto,
  ) {
    return this.auctionService.update(+id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedRequestUser,
  ) {
    return this.auctionService.remove(+id, user.id);
  }

  // 🔓 Public detail (placed last so `/me` is not shadowed by parameter route)
  @Public()
  @Get(':id')
  getAuctionDetail(@Param('id', ParseIntPipe) id: number) {
    return this.auctionService.findDetail(id);
  }
}
