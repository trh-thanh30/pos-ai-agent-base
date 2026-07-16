import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type IUser } from 'app/common/types/user.type';
import { AssetLinksRepository } from '../repository/asset-links.repository';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetEntityType } from '../types/asset-entity.type';

@Injectable()
export class UnlinkAssetFromEntityUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetLinksRepository: AssetLinksRepository,
  ) {}

  async execute(
    user: IUser,
    input: {
      assetId: string;
      entityId: string;
      entityType: AssetEntityType;
    },
  ) {
    if (!user.storeId) {
      throw new ForbiddenException('store_id is required');
    }

    const asset = await this.assetsRepository.findById(input.assetId);
    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }
    if (asset.store_id !== user.storeId) {
      throw new ForbiddenException('Asset belongs to another store');
    }

    const result = await this.assetLinksRepository.unlink({
      storeId: user.storeId,
      assetId: input.assetId,
      entityId: input.entityId,
      entityType: input.entityType,
    });

    if (result.count === 0) {
      throw new NotFoundException('Asset link not found');
    }
  }
}
