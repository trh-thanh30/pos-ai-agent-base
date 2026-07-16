import { NotFoundException } from '@nestjs/common';
import { asset_access_type } from '@prisma/client';
import { IUser } from 'app/common/types/user.type';
import { AssetEntityType } from '../types/asset-entity.type';
import { ReplaceEntityAssetsUseCase } from '../use-cases/replace-entity-assets.use-case';

describe('ReplaceEntityAssetsUseCase', () => {
  const mockUser = {
    id: 'user-1',
    storeId: 'store-1',
  } as IUser;

  it('replaces entity assets after validating all assets belong to the store', async () => {
    const assetsRepository = {
      findManyActiveByIds: jest.fn().mockResolvedValue([{ id: 'asset-1' }]),
    };
    const assetLinksRepository = {
      replaceEntityAssets: jest.fn().mockResolvedValue([
        {
          asset: {
            id: 'asset-1',
            access_type: asset_access_type.PUBLIC,
            path: 'public/products/asset-1.png',
            metadata: {},
          },
        },
      ]),
    };
    const assetUrlResolver = {
      enrich: jest.fn((asset) => ({ ...asset, url: 'https://asset.test' })),
    };
    const useCase = new ReplaceEntityAssetsUseCase(
      assetsRepository as never,
      assetLinksRepository as never,
      assetUrlResolver as never,
    );

    await expect(
      useCase.execute(mockUser, {
        entityId: 'entity-1',
        entityType: AssetEntityType.PRODUCT,
        assetIds: ['asset-1'],
      }),
    ).resolves.toEqual([
      expect.objectContaining({ id: 'asset-1', url: 'https://asset.test' }),
    ]);
    expect(assetLinksRepository.replaceEntityAssets).toHaveBeenCalledWith({
      storeId: 'store-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
      assetIds: ['asset-1'],
    });
  });

  it('rejects replace when any asset is missing or belongs to another store', async () => {
    const assetsRepository = {
      findManyActiveByIds: jest.fn().mockResolvedValue([{ id: 'asset-1' }]),
    };
    const assetLinksRepository = {
      replaceEntityAssets: jest.fn(),
    };
    const assetUrlResolver = {
      enrich: jest.fn(),
    };
    const useCase = new ReplaceEntityAssetsUseCase(
      assetsRepository as never,
      assetLinksRepository as never,
      assetUrlResolver as never,
    );

    await expect(
      useCase.execute(mockUser, {
        entityId: 'entity-1',
        entityType: AssetEntityType.PRODUCT,
        assetIds: ['asset-1', 'missing-asset'],
      }),
    ).rejects.toThrow(NotFoundException);
    expect(assetLinksRepository.replaceEntityAssets).not.toHaveBeenCalled();
  });
});
