import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RetailConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsIn(['classic', 'ecommerce', 'restaurant'])
  template_id?: string;

  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  logo_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  banner_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  facebook_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  tiktok_url?: string;
}

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  business_hour?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  subdomain?: string | null;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RetailConfigDto)
  retail_config?: RetailConfigDto;
}
