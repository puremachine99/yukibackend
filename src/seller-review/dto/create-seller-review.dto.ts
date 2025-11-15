import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSellerReviewDto {
  @IsInt()
  transactionId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  shippingScore?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
