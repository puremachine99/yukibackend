import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

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

  @Public()
  @Get(':id')
  getAuctionDetail(@Param('id') id: string) {
    return this.auctionService.findDetail(+id);
  }

  // 🔒 PRIVATE ROUTES

  @Post()
  create(@Req() req, @Body() dto: CreateAuctionDto) {
    return this.auctionService.create(req.user!.id, dto);
  }

  @Get('me')
  findAll(@Req() req) {
    return this.auctionService.findAll(req.user!);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateAuctionDto) {
    return this.auctionService.update(+id, req.user!, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.auctionService.remove(+id, req.user!);
  }
}
