import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';
import { AssetWithUrl } from '../types/asset-response.type';

@Injectable()
export class GetAssetDetailUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetUrlResolver: AssetUrlResolverService,
  ) {}

  async execute(id: string): Promise<AssetWithUrl> {
    const asset = await this.assetsRepository.findById(id);

    if (!asset || asset.is_deleted) {
      throw new NotFoundException('Asset not found');
    }

    return this.assetUrlResolver.enrich(asset);
  }
}
