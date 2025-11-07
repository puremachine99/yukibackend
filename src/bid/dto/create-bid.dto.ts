import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateBidDto {
  @IsNumber()
  @IsNotEmpty()
  itemOnAuctionId: number;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
