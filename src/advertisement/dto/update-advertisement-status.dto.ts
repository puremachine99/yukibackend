import { AdStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
} from 'class-validator';

export class UpdateAdvertisementStatusDto {
  @IsEnum(AdStatus)
  status: AdStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  transactionId?: number;
}
