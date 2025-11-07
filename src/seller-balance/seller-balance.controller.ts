import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SellerBalanceService } from './seller-balance.service';
import { CreateSellerBalanceDto } from './dto/create-seller-balance.dto';
import { UpdateSellerBalanceDto } from './dto/update-seller-balance.dto';

@Controller('seller-balance')
export class SellerBalanceController {
  constructor(private readonly sellerBalanceService: SellerBalanceService) {}

  @Post()
  create(@Body() createSellerBalanceDto: CreateSellerBalanceDto) {
    return this.sellerBalanceService.create(createSellerBalanceDto);
  }

  @Get()
  findAll() {
    return this.sellerBalanceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerBalanceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSellerBalanceDto: UpdateSellerBalanceDto) {
    return this.sellerBalanceService.update(+id, updateSellerBalanceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerBalanceService.remove(+id);
  }
}
