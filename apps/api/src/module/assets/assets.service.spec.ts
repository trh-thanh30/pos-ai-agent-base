import { NotFoundException } from '@nestjs/common';
import { Asset, asset_access_type, user_role } from '@prisma/client';
import { IUser } from 'app/common/types/user.type';
import { AssetsService } from './assets.service';
import { AssetPermissionPolicy } from './policies/asset-permission.policy';
import { CleanupTempAssetsUseCase } from './use-cases/cleanup-temp-assets.use-case';

describe('AssetPermissionPolicy', () => {
  const policy = new AssetPermissionPolicy();

  const mockUser: IUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    role: user_role.USER,
    status: 'ACTIVE',
    storeId: 'store-1',
  };

  const mockAdmin: IUser = {
    ...mockUser,
    id: 'admin-1',
    role: user_role.ADMIN,
  };

  const mockAsset: Asset = {
    id: 'asset-1',
    store_id: 'store-1',
    original_name: 'test.png',
    filename: 'unique.png',
    mime_type: 'image/png',
    size: 100,
    path: 'public/unique.png',
    access_type: asset_access_type.PUBLIC,
    type: 'IMAGE',
    folder: null,
    metadata: {},
    is_deleted: false,
    uploaded_by_id: 'user-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  it('allows admin to do anything', () => {
    expect(policy.can(mockAsset, mockAdmin, 'DELETE')).toBe(true);
  });

  it('allows owner to do anything', () => {
    expect(policy.can(mockAsset, mockUser, 'DELETE')).toBe(true);
  });

  it('allows anyone to read public assets', () => {
    const otherUser: IUser = { ...mockUser, id: 'user-2' };
    expect(policy.can(mockAsset, otherUser, 'READ')).toBe(true);
  });

  it('does not allow other users to delete assets', () => {
    const otherUser: IUser = { ...mockUser, id: 'user-2' };
    expect(policy.can(mockAsset, otherUser, 'DELETE')).toBe(false);
  });

  it('does not allow other users to read private assets', () => {
    const privateAsset = {
      ...mockAsset,
      access_type: asset_access_type.PRIVATE,
    };
    const otherUser: IUser = { ...mockUser, id: 'user-2' };
    expect(policy.can(privateAsset, otherUser, 'READ')).toBe(false);
  });
});

describe('AssetsService', () => {
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
    const assetPermissionPolicy = new AssetPermissionPolicy();

    const service = new AssetsService(
      uploadAssetUseCase as never,
      getAssetDetailUseCase as never,
      listAssetsUseCase as never,
      deleteAssetUseCase as never,
      streamPrivateAssetUseCase as never,
      cleanupTempAssetsUseCase as never,
      listEntityAssetsUseCase as never,
      linkAssetToEntityUseCase as never,
      assetPermissionPolicy,
    );

    return {
      service,
      getAssetDetailUseCase,
      cleanupTempAssetsUseCase,
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
    const { service } = createService();
    const linkAssetToEntityUseCase = (
      service as unknown as {
        linkAssetToEntityUseCase: { execute: jest.Mock };
      }
    ).linkAssetToEntityUseCase;
    linkAssetToEntityUseCase.execute.mockResolvedValue({ id: 'link-1' });

    await service.linkAssetToEntity(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: 'product',
    });

    expect(linkAssetToEntityUseCase.execute).toHaveBeenCalledWith(mockUser, {
      assetId: 'asset-1',
      entityId: 'entity-1',
      entityType: 'product',
    });
  });
});

describe('CleanupTempAssetsUseCase', () => {
  it('deletes temp assets older than 24h', async () => {
    const oldTempAsset = {
      id: 'old-1',
      filename: 'old.png',
      path: 'temp/old.png',
    };
    const assetsRepository = {
      findExpiredTempAssets: jest.fn().mockResolvedValue([oldTempAsset]),
      markDeleted: jest.fn().mockResolvedValue(undefined),
    };
    const storage = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new CleanupTempAssetsUseCase(
      assetsRepository as never,
      storage as never,
    );

    await useCase.execute();

    expect(storage.delete).toHaveBeenCalledWith(oldTempAsset.path);
    expect(assetsRepository.markDeleted).toHaveBeenCalledWith(oldTempAsset.id);
  });
});
