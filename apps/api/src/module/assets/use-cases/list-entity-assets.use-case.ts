import { ForbiddenException, Injectable } from '@nestjs/common';
import { AssetLinksRepository } from '../repository/asset-links.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';

@Injectable()
export class ListEntityAssetsUseCase {
  constructor(
    private readonly assetLinksRepository: AssetLinksRepository,
    private readonly assetUrlResolver: AssetUrlResolverService,
  ) {}

  async execute(input: {
    storeId: string;
    entityId: string;
    entityType: string;
  }) {
    if (!input.storeId) {
      throw new ForbiddenException('store_id is required');
    }

    const links = await this.assetLinksRepository.listByEntity(input);
    return links.map((link) => this.assetUrlResolver.enrich(link.asset));
  }
}
