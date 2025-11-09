import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @IsNumber()
  @Min(10000)
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}
