import { Injectable } from '@nestjs/common';
import { CreateSellerBalanceDto } from './dto/create-seller-balance.dto';
import { UpdateSellerBalanceDto } from './dto/update-seller-balance.dto';

@Injectable()
export class SellerBalanceService {
  create(createSellerBalanceDto: CreateSellerBalanceDto) {
    return 'This action adds a new sellerBalance';
  }

  findAll() {
    return `This action returns all sellerBalance`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sellerBalance`;
  }

  update(id: number, updateSellerBalanceDto: UpdateSellerBalanceDto) {
    return `This action updates a #${id} sellerBalance`;
  }

  remove(id: number) {
    return `This action removes a #${id} sellerBalance`;
  }
}
