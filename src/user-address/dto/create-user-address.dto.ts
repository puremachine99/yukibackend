import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserAddressDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsPhoneNumber('ID')
  phone: string;

  @IsString()
  @IsNotEmpty()
  addressLine: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string = 'Indonesia';

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
