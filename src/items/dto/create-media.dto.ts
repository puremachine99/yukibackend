import { IsIn, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateMediaDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsIn(['image', 'video'])
  type: 'image' | 'video';
}
