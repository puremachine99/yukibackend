import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAdPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsInt()
  duration: number; // days

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
