import { Injectable, NotFoundException } from '@nestjs/common';
import { AssetWithUrl } from '../dto/asset-response.dto';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';

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
