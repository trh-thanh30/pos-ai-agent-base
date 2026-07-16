import { CleanupTempAssetsUseCase } from '../use-cases/cleanup-temp-assets.use-case';

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
