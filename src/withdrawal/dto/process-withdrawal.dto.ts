import { IsString, IsOptional, IsIn } from 'class-validator';
import { WithdrawalStatus } from '@prisma/client';

export class ProcessWithdrawalDto {
  @IsIn([
    WithdrawalStatus.approved,
    WithdrawalStatus.rejected,
    WithdrawalStatus.paid,
  ])
  status: WithdrawalStatus;

  @IsOptional()
  @IsString()
  payoutReference?: string;

  @IsOptional()
  @IsString()
  payoutReceipt?: string;
}
