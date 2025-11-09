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
import { BidService } from './bid.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidDto } from './dto/update-bid.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bid')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateBidDto) {
    return this.bidService.create(req.user!.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.bidService.findAll(req.user!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.bidService.findOne(+id, req.user!);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateBidDto) {
    return this.bidService.update(+id, req.user!, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.bidService.remove(+id, req.user!);
  }
}
