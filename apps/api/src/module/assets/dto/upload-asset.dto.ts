import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AssetEntityType } from '../types/asset-entity.type';

export enum AssetAccessTypeDto {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEMP = 'TEMP',
}

export class UploadAssetDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsEnum(AssetEntityType)
  entityType?: AssetEntityType;

  @IsOptional()
  @IsEnum(AssetAccessTypeDto)
  accessType?: AssetAccessTypeDto;
}
