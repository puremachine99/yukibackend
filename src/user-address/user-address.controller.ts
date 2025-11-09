import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('user-address')
export class UserAddressController {
  constructor(private readonly service: UserAddressService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateUserAddressDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.service.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOne(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateUserAddressDto) {
    return this.service.update(+id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.service.remove(+id, req.user.id);
  }

  @Patch(':id/default')
  setDefault(@Param('id') id: string, @Req() req) {
    return this.service.setDefault(+id, req.user.id);
  }
}
