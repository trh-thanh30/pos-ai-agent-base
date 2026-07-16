import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { asset_access_type } from '@prisma/client';
import { type IUser } from 'app/common/types/user.type';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadAssetDto } from '../dto/upload-asset.dto';
import { AssetsRepository } from '../repository/assets.repository';
import { AssetUrlResolverService } from '../services/asset-url-resolver.service';
import { FileValidatorService } from '../services/file-validator.service';
import type { IStorageService } from '../services/storage.interface';
import { AssetWithUrl } from '../types/asset-response.type';
import { AssetTypeResolver } from '../utils/asset-type-resolver.util';

@Injectable()
export class UploadAssetUseCase {
  constructor(
    private readonly assetsRepository: AssetsRepository,
    @Inject('IStorageService') private readonly storage: IStorageService,
    private readonly fileValidator: FileValidatorService,
    private readonly assetUrlResolver: AssetUrlResolverService,
    private readonly assetTypeResolver: AssetTypeResolver,
  ) {}

  async execute(
    user: IUser,
    file: Express.Multer.File,
    dto: UploadAssetDto,
  ): Promise<AssetWithUrl> {
    this.fileValidator.validateFile(file);

    const storeId = user.storeId;
    if (!storeId) {
      throw new ForbiddenException('store_id is required');
    }

    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const accessType = dto.accessType
      ? (dto.accessType as asset_access_type)
      : asset_access_type.PUBLIC;
    const folderPath = dto.folder
      ? `${year}/${month}/${dto.folder}`
      : `${year}/${month}`;
    const fileExt = path.extname(file.originalname);
    const uniqueName = `${Date.now()}_${uuidv4()}${fileExt}`;

    const { path: relativePath, size } = await this.storage.save(
      file,
      folderPath,
      uniqueName,
      accessType,
    );

    const asset = await this.assetsRepository.create({
      store: { connect: { id: storeId } },
      original_name: file.originalname,
      filename: uniqueName,
      mime_type: file.mimetype,
      size,
      path: relativePath,
      access_type: accessType,
      type: this.assetTypeResolver.resolve(file.mimetype),
      uploaded_by: { connect: { id: user.id } },
      folder: dto.folder || null,
      metadata: {},
      links:
        dto.entityId && dto.entityType
          ? {
              create: {
                store_id: storeId,
                entity_id: dto.entityId,
                entity_type: dto.entityType,
              },
            }
          : undefined,
    });

    return this.assetUrlResolver.enrich(asset);
  }
}
