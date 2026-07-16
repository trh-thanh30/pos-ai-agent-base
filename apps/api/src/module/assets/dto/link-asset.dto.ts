import { IsEnum, IsUUID } from 'class-validator';
import { AssetEntityType } from '../types/asset-entity.type';

export class LinkAssetDto {
  @IsUUID()
  entityId: string;

  @IsEnum(AssetEntityType)
  entityType: AssetEntityType;
}
