import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { storageConfig } from 'app/config';
import { AuthModule } from 'app/module/auth/auth.module';
import { JwtAuthGuard } from 'app/module/auth/guards/jwt-auth.guard';
import { PrismaService } from 'app/prisma/prisma.service';
import { memoryStorage } from 'multer';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AssetPermissionPolicy } from './policies/asset-permission.policy';
import { AssetLinksRepository } from './repository/asset-links.repository';
import { AssetsRepository } from './repository/assets.repository';
import { AssetUrlResolverService } from './services/asset-url-resolver.service';
import { FileValidatorService } from './services/file-validator.service';
import { LocalStorageService } from './services/local-storage.service';
import { MinioStorageService } from './services/minio-storage.service';
import { CleanupTempAssetsUseCase } from './use-cases/cleanup-temp-assets.use-case';
import { DeleteAssetUseCase } from './use-cases/delete-asset.use-case';
import { GetAssetDetailUseCase } from './use-cases/get-asset-detail.use-case';
import { LinkAssetToEntityUseCase } from './use-cases/link-asset-to-entity.use-case';
import { ListAssetsUseCase } from './use-cases/list-assets.use-case';
import { ListEntityAssetsUseCase } from './use-cases/list-entity-assets.use-case';
import { StreamPrivateAssetUseCase } from './use-cases/stream-private-asset.use-case';
import { UploadAssetUseCase } from './use-cases/upload-asset.use-case';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AssetsController],
  providers: [
    PrismaService,
    JwtAuthGuard,
    AssetsService,
    AssetsRepository,
    AssetLinksRepository,
    AssetPermissionPolicy,
    AssetUrlResolverService,
    FileValidatorService,
    UploadAssetUseCase,
    GetAssetDetailUseCase,
    ListAssetsUseCase,
    DeleteAssetUseCase,
    StreamPrivateAssetUseCase,
    CleanupTempAssetsUseCase,
    ListEntityAssetsUseCase,
    LinkAssetToEntityUseCase,
    {
      provide: 'IStorageService',
      useFactory: (config: ConfigType<typeof storageConfig>) => {
        if (config.driver === 'minio' || config.driver === 's3') {
          return new MinioStorageService(config);
        }

        return new LocalStorageService(config);
      },
      inject: [storageConfig.KEY],
    },
  ],
  exports: [
    AssetsService,
    AssetLinksRepository,
    AssetsRepository,
    LinkAssetToEntityUseCase,
    ListEntityAssetsUseCase,
  ],
})
export class AssetsModule {}
