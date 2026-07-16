import { Injectable } from '@nestjs/common';
import { ListAssetsDto } from '../dto/list-assets.dto';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';

@Injectable()
export class ListAssetsUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    private readonly assetUrlResolver: AssetUrlResolverService,
  ) {}

  async execute(dto: ListAssetsDto) {
    const result = await this.assetsRepository.list(dto);

    return {
      ...result,
      items: result.items.map((asset) => this.assetUrlResolver.enrich(asset)),
    };
  }
}
