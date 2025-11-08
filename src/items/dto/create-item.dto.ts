import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsUrl,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

class MediaInput {
  @IsUrl()
  url: string;

  @IsIn(['image', 'video'])
  type: 'image' | 'video';
}

export class CreateItemDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  startingBid?: number;

  @IsOptional()
  @IsNumber()
  buyItNow?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaInput)
  media?: MediaInput[];
}
