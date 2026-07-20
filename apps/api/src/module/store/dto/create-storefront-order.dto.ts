import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateStorefrontOrderItemDto {
  @IsUUID()
  product_id: string;

  @IsUUID()
  variant_id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateStorefrontOrderDto {
  @IsString()
  @MaxLength(100)
  customer_name: string;

  @IsString()
  @IsPhoneNumber('VN')
  customer_phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  customer_address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  customer_note?: string;

  @IsOptional()
  @IsIn(['cod', 'bank_transfer'])
  payment_method?: 'cod' | 'bank_transfer';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateStorefrontOrderItemDto)
  items: CreateStorefrontOrderItemDto[];
}
