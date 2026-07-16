import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type IUser } from 'app/common/types/user.type';
import { AssetLinksRepository } from '../repository/asset-links.repository';
import { AssetsRepository } from '../repository/assets.repository';

@Injectable()
export class LinkAssetToEntityUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetLinksRepository: AssetLinksRepository,
  ) {}

  async execute(
    user: IUser,
    input: { assetId: string; entityId: string; entityType: string },
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

    return this.assetLinksRepository.link({
      storeId: user.storeId,
      assetId: input.assetId,
      entityId: input.entityId,
      entityType: input.entityType,
    });
  }
}
