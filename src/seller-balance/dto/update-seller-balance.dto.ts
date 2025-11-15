import { PartialType } from '@nestjs/mapped-types';
import { CreateSellerBalanceDto } from './create-seller-balance.dto';

export class UpdateSellerBalanceDto extends PartialType(
  CreateSellerBalanceDto,
) {}
