import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type IUser } from 'app/common/types/user.type';
import { AssetLinksRepository } from '../repository/asset-links.repository';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';
import { AssetEntityType } from '../types/asset-entity.type';

@Injectable()
export class ReplaceEntityAssetsUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetLinksRepository: AssetLinksRepository,
    private readonly assetUrlResolver: AssetUrlResolverService,
  ) {}

  async execute(
    user: IUser,
    input: {
      entityId: string;
      entityType: AssetEntityType;
      assetIds: string[];
    },
  ) {
    if (!user.storeId) {
      throw new ForbiddenException('store_id is required');
    }

    if (input.assetIds.length > 0) {
      const assets = await this.assetsRepository.findManyActiveByIds(
        user.storeId,
        input.assetIds,
      );
      const foundAssetIds = new Set(assets.map((asset) => asset.id));
      const missingAssetIds = input.assetIds.filter(
        (assetId) => !foundAssetIds.has(assetId),
      );

      if (missingAssetIds.length > 0) {
        throw new NotFoundException('One or more assets were not found');
      }
    }

    const links = await this.assetLinksRepository.replaceEntityAssets({
      storeId: user.storeId,
      entityId: input.entityId,
      entityType: input.entityType,
      assetIds: input.assetIds,
    });

    return links.map((link) => this.assetUrlResolver.enrich(link.asset));
  }
}
