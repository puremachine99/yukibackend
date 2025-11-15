import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedRequestUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Public()
  @Get()
  findAll(
    @Query('ownerId') ownerId?: string,
    @Query('category') category?: string,
    @Query('isSold') isSold?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.itemsService.findAll({
      ownerId: ownerId ? Number(ownerId) : undefined,
      category,
      isSold: isSold === 'true' ? true : isSold === 'false' ? false : undefined,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(+id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() createItemDto: CreateItemDto,
  ) {
    return this.itemsService.create(user.id, createItemDto);
  }

  @Post(':id/media')
  uploadMedia(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: CreateMediaDto,
  ) {
    return this.itemsService.uploadMedia(+id, user.id, dto);
  }

  @Public()
  @Get(':id/media')
  getMedia(@Param('id') id: string) {
    return this.itemsService.getMedia(+id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.update(+id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.itemsService.remove(+id, user.id);
  }
}
