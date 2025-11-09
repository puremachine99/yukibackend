import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  cartId: number;

  @IsNumber()
  buyerId: number;

  @IsNumber()
  sellerId: number;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  paymentGateway?: string;
}
