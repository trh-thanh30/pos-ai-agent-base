import { IsString, IsUUID, MaxLength } from 'class-validator';

export class LinkAssetDto {
  @IsUUID()
  entityId: string;

  @IsString()
  @MaxLength(50)
  entityType: string;
}
