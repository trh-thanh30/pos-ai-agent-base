import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Asset } from '@prisma/client';
import { type IUser } from 'app/common/types/user.type';
import { Readable } from 'stream';
import { AssetPermissionAction } from './policies/asset-permission.policy';
import { AssetPermissionPolicy } from './policies/asset-permission.policy';
import { AssetWithUrl } from './dto/asset-response.dto';
import { ListAssetsDto } from './dto/list-assets.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { CleanupTempAssetsUseCase } from './use-cases/cleanup-temp-assets.use-case';
import { DeleteAssetUseCase } from './use-cases/delete-asset.use-case';
import { GetAssetDetailUseCase } from './use-cases/get-asset-detail.use-case';
import { LinkAssetToEntityUseCase } from './use-cases/link-asset-to-entity.use-case';
import { ListAssetsUseCase } from './use-cases/list-assets.use-case';
import { ListEntityAssetsUseCase } from './use-cases/list-entity-assets.use-case';
import { StreamPrivateAssetUseCase } from './use-cases/stream-private-asset.use-case';
import { UploadAssetUseCase } from './use-cases/upload-asset.use-case';

@Injectable()
export class AssetsService {
  constructor(
    private readonly uploadAssetUseCase: UploadAssetUseCase,
    private readonly getAssetDetailUseCase: GetAssetDetailUseCase,
    private readonly listAssetsUseCase: ListAssetsUseCase,
    private readonly deleteAssetUseCase: DeleteAssetUseCase,
    private readonly streamPrivateAssetUseCase: StreamPrivateAssetUseCase,
    private readonly cleanupTempAssetsUseCase: CleanupTempAssetsUseCase,
    private readonly listEntityAssetsUseCase: ListEntityAssetsUseCase,
    private readonly linkAssetToEntityUseCase: LinkAssetToEntityUseCase,
    private readonly assetPermissionPolicy: AssetPermissionPolicy,
  ) {}

  uploadFile(
    user: IUser,
    file: Express.Multer.File,
    dto: UploadAssetDto,
  ): Promise<AssetWithUrl> {
    return this.uploadAssetUseCase.execute(user, file, dto);
  }

  getAsset(id: string): Promise<AssetWithUrl> {
    return this.getAssetDetailUseCase.execute(id);
  }

  listAssets(dto: ListAssetsDto) {
    return this.listAssetsUseCase.execute(dto);
  }

  deleteAsset(id: string, user: IUser): Promise<void> {
    return this.deleteAssetUseCase.execute(id, user);
  }

  getDownloadStream(
    id: string,
    user: IUser,
  ): Promise<{ stream: Readable; asset: Asset }> {
    return this.streamPrivateAssetUseCase.execute(id, user);
  }

  listEntityAssets(input: {
    storeId: string;
    entityId: string;
    entityType: string;
  }) {
    return this.listEntityAssetsUseCase.execute(input);
  }

  linkAssetToEntity(
    user: IUser,
    input: { assetId: string; entityId: string; entityType: string },
  ) {
    return this.linkAssetToEntityUseCase.execute(user, input);
  }

  checkPermission(
    asset: Asset,
    user: IUser,
    action: AssetPermissionAction,
  ): boolean {
    return this.assetPermissionPolicy.can(asset, user, action);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  cleanupTempAssets(): Promise<void> {
    return this.cleanupTempAssetsUseCase.execute();
  }
}
