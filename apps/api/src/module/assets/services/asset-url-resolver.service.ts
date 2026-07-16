import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Asset, asset_access_type } from '@prisma/client';
import { storageConfig } from 'app/config';
import { AssetWithUrl } from '../types/asset-response.type';

@Injectable()
export class AssetUrlResolverService {
  private readonly cdnUrl: string;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.cdnUrl = this.config.cdnUrl;
  }

  enrich(asset: Asset): AssetWithUrl {
    let url: string;

    if (asset.access_type === asset_access_type.PUBLIC) {
      const cleanPath = asset.path.startsWith('public/')
        ? asset.path.replace('public/', '')
        : asset.path;
      url = `${this.cdnUrl}/${cleanPath}`;
    } else {
      url = `/api/v1/assets/private/${asset.id}/stream`;
    }

    return {
      ...asset,
      url,
      metadata: asset.metadata as Record<string, unknown>,
    };
  }
}
