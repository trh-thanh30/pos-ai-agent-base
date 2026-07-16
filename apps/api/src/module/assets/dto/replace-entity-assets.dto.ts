import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReplaceEntityAssetsDto {
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  assetIds: string[];
}
