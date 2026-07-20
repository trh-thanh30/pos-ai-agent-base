import {
  IsBoolean,
  IsHexColor,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class StorefrontBrandDto {
  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsHexColor()
  accent_color?: string;

  @IsOptional()
  @IsHexColor()
  background_color?: string;

  @IsOptional()
  @IsHexColor()
  text_color?: string;

  @IsOptional()
  @IsIn(['modern', 'editorial', 'friendly'])
  font_pair?: string;

  @IsOptional()
  @IsIn(['sharp', 'soft', 'rounded'])
  radius?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  logo_url?: string;

  @IsOptional()
  @IsString()
  logo_asset_id?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  banner_url?: string;

  @IsOptional()
  @IsString()
  banner_asset_id?: string;
}

class StorefrontAnnouncementDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  text?: string;
}

class StorefrontHomeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  hero_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  hero_subtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  hero_cta_label?: string;

  @IsOptional()
  @IsBoolean()
  show_hero?: boolean;

  @IsOptional()
  @IsBoolean()
  show_categories?: boolean;

  @IsOptional()
  @IsBoolean()
  show_featured_products?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  featured_heading?: string;
}

class StorefrontCatalogDto {
  @IsOptional()
  @IsBoolean()
  show_search?: boolean;

  @IsOptional()
  @IsBoolean()
  show_category_filter?: boolean;

  @IsOptional()
  @IsBoolean()
  show_product_description?: boolean;

  @IsOptional()
  @IsBoolean()
  show_stock_status?: boolean;

  @IsOptional()
  @IsBoolean()
  show_out_of_stock?: boolean;

  @IsOptional()
  @IsBoolean()
  quick_add?: boolean;

  @IsOptional()
  @IsIn(['square', 'portrait', 'landscape'])
  image_ratio?: string;

  @IsOptional()
  @IsInt()
  @Min(24)
  @Max(48)
  products_per_page?: number;
}

class StorefrontCheckoutDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_note?: boolean;

  @IsOptional()
  @IsBoolean()
  require_address?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_cod?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_bank_transfer?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  success_message?: string;
}

class StorefrontFooterDto {
  @IsOptional()
  @IsBoolean()
  show_contact?: boolean;

  @IsOptional()
  @IsBoolean()
  show_business_hours?: boolean;

  @IsOptional()
  @IsBoolean()
  show_powered_by?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  policy_text?: string;
}

class StorefrontSocialDto {
  @IsOptional()
  @IsUrl({ require_protocol: true })
  facebook_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  instagram_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  tiktok_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  zalo_url?: string;
}

class StorefrontSeoDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  description?: string;
}

export class RetailConfigDto {
  @IsOptional()
  @IsInt()
  @IsIn([2])
  schema_version?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsIn([
    'market',
    'editorial',
    'specialist',
    'classic',
    'ecommerce',
    'restaurant',
  ])
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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontBrandDto)
  brand?: StorefrontBrandDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontAnnouncementDto)
  announcement?: StorefrontAnnouncementDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontHomeDto)
  home?: StorefrontHomeDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontCatalogDto)
  catalog?: StorefrontCatalogDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontCheckoutDto)
  checkout?: StorefrontCheckoutDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontFooterDto)
  footer?: StorefrontFooterDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontSocialDto)
  social?: StorefrontSocialDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => StorefrontSeoDto)
  seo?: StorefrontSeoDto;
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
