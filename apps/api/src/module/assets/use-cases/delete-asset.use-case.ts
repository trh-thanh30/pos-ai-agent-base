import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { type IUser } from 'app/common/types/user.type';
import { AssetPermissionPolicy } from '../policies/asset-permission.policy';
import { AssetsRepository } from '../repository/assets.repository';
import type { IStorageService } from '../services/storage.interface';

@Injectable()
export class DeleteAssetUseCase {
  private readonly logger = new Logger(DeleteAssetUseCase.name);

  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetPermissionPolicy: AssetPermissionPolicy,
    @Inject('IStorageService') private readonly storage: IStorageService,
  ) {}

  async execute(id: string, user: IUser): Promise<void> {
    const asset = await this.assetsRepository.findById(id);

    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }

    if (!this.assetPermissionPolicy.can(asset, user, 'DELETE')) {
      throw new ForbiddenException(
        'You do not have permission to delete this asset',
      );
    }

    await this.assetsRepository.markDeleted(id);

    try {
      await this.storage.delete(asset.path);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to delete file for asset ${id}: ${message}`);
    }
  }
}
