import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsInt()
  @IsNotEmpty()
  itemOnAuctionId: number;

  @IsOptional()
  @IsInt()
  parentId?: number;
}
