import { IsOptional, IsString } from 'class-validator';

export class PayCartDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string; // contoh: "manual_transfer", "virtual_account", "gopay"

  @IsOptional()
  @IsString()
  note?: string;
}
