import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Asset } from '@prisma/client';
import { type IUser } from 'app/common/types/user.type';
import { Readable } from 'stream';
import { AssetPermissionPolicy } from '../policies/asset-permission.policy';
import { AssetsRepository } from '../repository/assets.repository';
import type { IStorageService } from '../services/storage.interface';

@Injectable()
export class StreamPrivateAssetUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetPermissionPolicy: AssetPermissionPolicy,
    @Inject('IStorageService') private readonly storage: IStorageService,
  ) {}

  async execute(
    id: string,
    user: IUser,
  ): Promise<{ stream: Readable; asset: Asset }> {
    const asset = await this.assetsRepository.findById(id);

    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }

    if (!this.assetPermissionPolicy.can(asset, user, 'READ')) {
      throw new ForbiddenException(
        'You do not have permission to access this asset',
      );
    }

    const stream = await this.storage.getStream(asset.path);
    return { stream, asset };
  }
}
