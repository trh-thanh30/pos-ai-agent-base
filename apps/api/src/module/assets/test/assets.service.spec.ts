import { NotFoundException } from '@nestjs/common';
import { IUser } from 'app/common/types/user.type';
import { AssetsService } from '../assets.service';
import { AssetPermissionPolicy } from '../policies/asset-permission.policy';
import { AssetEntityType } from '../types/asset-entity.type';

describe('AssetsService facade', () => {
  const mockUser = {
    id: 'user-1',
    storeId: 'store-1',
  } as IUser;

  const createService = () => {
    const uploadAssetUseCase = { execute: jest.fn() };
    const getAssetDetailUseCase = { execute: jest.fn() };
    const listAssetsUseCase = { execute: jest.fn() };
    const deleteAssetUseCase = { execute: jest.fn() };
    const streamPrivateAssetUseCase = { execute: jest.fn() };
    const cleanupTempAssetsUseCase = { execute: jest.fn() };
    const listEntityAssetsUseCase = { execute: jest.fn() };
    const linkAssetToEntityUseCase = { execute: jest.fn() };
    const unlinkAssetFromEntityUseCase = { execute: jest.fn() };
    const replaceEntityAssetsUseCase = { execute: jest.fn() };

    const service = new AssetsService(
      uploadAssetUseCase as never,
      getAssetDetailUseCase as never,
      listAssetsUseCase as never,
      deleteAssetUseCase as never,
      streamPrivateAssetUseCase as never,
      cleanupTempAssetsUseCase as never,
      listEntityAssetsUseCase as never,
      linkAssetToEntityUseCase as never,
      unlinkAssetFromEntityUseCase as never,
      replaceEntityAssetsUseCase as never,
      new AssetPermissionPolicy(),
    );

    return {
      service,
      getAssetDetailUseCase,
      cleanupTempAssetsUseCase,
      linkAssetToEntityUseCase,
      unlinkAssetFromEntityUseCase,
      replaceEntityAssetsUseCase,
    };
  };

  it('delegates getAsset to GetAssetDetailUseCase', async () => {
    const { service, getAssetDetailUseCase } = createService();
    getAssetDetailUseCase.execute.mockResolvedValue({ id: 'asset-1' });

    await expect(service.getAsset('asset-1')).resolves.toEqual({
      id: 'asset-1',
    });
    expect(getAssetDetailUseCase.execute).toHaveBeenCalledWith('asset-1');
  });

  it('delegates not found errors from GetAssetDetailUseCase', async () => {
    const { service, getAssetDetailUseCase } = createService();
    getAssetDetailUseCase.execute.mockRejectedValue(
      new NotFoundException('Asset not found'),
    );

    await expect(service.getAsset('none')).rejects.toThrow(NotFoundException);
  });

  it('delegates cleanupTempAssets to CleanupTempAssetsUseCase', async () => {
    const { service, cleanupTempAssetsUseCase } = createService();
    cleanupTempAssetsUseCase.execute.mockResolvedValue(undefined);

    await service.cleanupTempAssets();

    expect(cleanupTempAssetsUseCase.execute).toHaveBeenCalledWith();
  });

  it('delegates linkAssetToEntity to LinkAssetToEntityUseCase', async () => {
    const { service, linkAssetToEntityUseCase } = createService();
    linkAssetToEntityUseCase.execute.mockResolvedValue({ id: 'link-1' });

    await service.linkAssetToEntity(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
    });

    expect(linkAssetToEntityUseCase.execute).toHaveBeenCalledWith(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
    });
  });

  it('delegates unlinkAssetFromEntity to UnlinkAssetFromEntityUseCase', async () => {
    const { service, unlinkAssetFromEntityUseCase } = createService();
    unlinkAssetFromEntityUseCase.execute.mockResolvedValue(undefined);

    await service.unlinkAssetFromEntity(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
    });

    expect(unlinkAssetFromEntityUseCase.execute).toHaveBeenCalledWith(
      mockUser,
      {
        assetId: 'asset-1',
        entityId: 'entity-1',
        entityType: AssetEntityType.PRODUCT,
      },
    );
  });

  it('delegates replaceEntityAssets to ReplaceEntityAssetsUseCase', async () => {
    const { service, replaceEntityAssetsUseCase } = createService();
    replaceEntityAssetsUseCase.execute.mockResolvedValue([]);

    await service.replaceEntityAssets(mockUser, {
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
      assetIds: ['asset-1'],
    });

    expect(replaceEntityAssetsUseCase.execute).toHaveBeenCalledWith(mockUser, {
      entityId: 'entity-1',
      entityType: AssetEntityType.PRODUCT,
      assetIds: ['asset-1'],
    });
  });
});
