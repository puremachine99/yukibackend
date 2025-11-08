import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
