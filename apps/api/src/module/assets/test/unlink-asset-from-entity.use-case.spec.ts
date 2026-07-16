import { NotFoundException } from '@nestjs/common';
import { IUser } from 'app/common/types/user.type';
import { AssetEntityType } from '../types/asset-entity.type';
import { UnlinkAssetFromEntityUseCase } from '../use-cases/unlink-asset-from-entity.use-case';

describe('UnlinkAssetFromEntityUseCase', () => {
  const mockUser = {
    id: 'user-1',
    storeId: 'store-1',
  } as IUser;
  const mockAsset = {
    id: 'asset-1',
    store_id: 'store-1',
    is_deleted: false,
  };

  it('unlinks an existing same-store asset link', async () => {
    const assetsRepository = {
      findById: jest.fn().mockResolvedValue(mockAsset),
    };
    const assetLinksRepository = {
      unlink: jest.fn().mockResolvedValue({ count: 1 }),
    };
    const useCase = new UnlinkAssetFromEntityUseCase(
      assetsRepository as never,
      assetLinksRepository as never,
    );

    await useCase.execute(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
    });

    expect(assetLinksRepository.unlink).toHaveBeenCalledWith({
      storeId: 'store-1',
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
    });
  });

  it('throws when unlink target does not exist', async () => {
    const assetsRepository = {
      findById: jest.fn().mockResolvedValue(mockAsset),
    };
    const assetLinksRepository = {
      unlink: jest.fn().mockResolvedValue({ count: 0 }),
    };
    const useCase = new UnlinkAssetFromEntityUseCase(
      assetsRepository as never,
      assetLinksRepository as never,
    );

    await expect(
      useCase.execute(mockUser, {
        assetId: 'asset-1',
        entityId: 'entity-1',
        entityType: AssetEntityType.PRODUCT,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
