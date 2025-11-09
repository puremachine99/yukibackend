import { IsNumber, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsNotEmpty()
  itemOnAuctionId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isBuyNow?: boolean;
}
