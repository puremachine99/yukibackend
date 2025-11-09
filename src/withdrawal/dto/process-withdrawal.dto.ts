import { IsString, IsOptional, IsIn } from 'class-validator';

export class ProcessWithdrawalDto {
  @IsIn(['approved', 'rejected', 'paid'])
  status: string;

  @IsOptional()
  @IsString()
  payoutReference?: string;

  @IsOptional()
  @IsString()
  payoutReceipt?: string;
}
