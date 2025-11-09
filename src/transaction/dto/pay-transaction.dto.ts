import { IsOptional, IsString } from 'class-validator';

export class PayTransactionDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string; // ex: manual, gopay, bank_transfer

  @IsOptional()
  @IsString()
  note?: string;
}
