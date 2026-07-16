import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AssetsRepository } from '../repository/assets.repository';
import type { IStorageService } from '../services/storage.interface';

@Injectable()
export class CleanupTempAssetsUseCase {
  private readonly logger = new Logger(CleanupTempAssetsUseCase.name);

  constructor(
    private readonly assetsRepository: AssetsRepository,
    @Inject('IStorageService') private readonly storage: IStorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async execute(): Promise<void> {
    this.logger.log('Starting cleanup of temporary assets...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const tempAssets =
      await this.assetsRepository.findExpiredTempAssets(yesterday);

    for (const asset of tempAssets) {
      try {
        await this.storage.delete(asset.path);
        await this.assetsRepository.markDeleted(asset.id);
        this.logger.debug(`Cleaned up temp asset: ${asset.filename}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to cleanup temp asset ${asset.filename}: ${message}`,
        );
      }
    }
  }
}
