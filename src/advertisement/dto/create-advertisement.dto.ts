import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsDateString,
} from 'class-validator';

export class CreateAdvertisementDto {
  @IsInt()
  adPlanId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUrl()
  mediaUrl: string;

  @IsOptional()
  @IsUrl()
  redirectUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  transactionId?: number;
}
