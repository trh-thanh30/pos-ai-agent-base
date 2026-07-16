import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { storageConfig } from 'app/config';
import { Client } from 'minio';
import { Readable } from 'stream';
import type { IStorageService, SaveResult } from './storage.interface';

type StorageAccessType = 'PUBLIC' | 'PRIVATE' | 'TEMP';

@Injectable()
export class MinioStorageService implements IStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: Client;

  constructor(
    @Inject(storageConfig.KEY)
    private readonly config: ConfigType<typeof storageConfig>,
  ) {
    this.client = new Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }

  async save(
    file: Express.Multer.File,
    folder: string,
    filename: string,
    accessType: StorageAccessType,
  ): Promise<SaveResult> {
    const bucket = this.getBucket(accessType);
    const prefix = this.getPathPrefix(accessType);
    const objectName = `${folder}/${filename}`;

    await this.client.putObject(bucket, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
      'X-Original-Name': encodeURIComponent(file.originalname),
    });

    const relativePath = `${prefix}/${objectName}`;
    this.logger.debug(`Saved object: ${bucket}/${objectName}`);
    return { path: relativePath, size: file.size };
  }

  async delete(relativePath: string): Promise<void> {
    const { bucket, objectName } = this.parseRelativePath(relativePath);

    try {
      await this.client.removeObject(bucket, objectName);
      this.logger.debug(`Deleted object: ${bucket}/${objectName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Object delete failed: ${bucket}/${objectName}: ${message}`,
      );
    }
  }

  async getStream(relativePath: string): Promise<Readable> {
    const { bucket, objectName } = this.parseRelativePath(relativePath);

    try {
      return await this.client.getObject(bucket, objectName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new NotFoundException(
        `File not found: ${relativePath}: ${message}`,
      );
    }
  }

  private getBucket(accessType: StorageAccessType): string {
    switch (accessType) {
      case 'PUBLIC':
        return this.config.minio.buckets.public;
      case 'PRIVATE':
        return this.config.minio.buckets.private;
      case 'TEMP':
        return this.config.minio.buckets.temp;
    }
  }

  private getPathPrefix(accessType: StorageAccessType): string {
    switch (accessType) {
      case 'PUBLIC':
        return this.config.publicDirName;
      case 'PRIVATE':
        return this.config.privateDirName;
      case 'TEMP':
        return this.config.tempDirName;
    }
  }

  private parseRelativePath(relativePath: string): {
    bucket: string;
    objectName: string;
  } {
    const [prefix, ...objectParts] = relativePath.split('/');
    const objectName = objectParts.join('/');

    if (!prefix || !objectName) {
      throw new NotFoundException(`Invalid asset path: ${relativePath}`);
    }

    if (prefix === this.config.publicDirName) {
      return { bucket: this.config.minio.buckets.public, objectName };
    }
    if (prefix === this.config.privateDirName) {
      return { bucket: this.config.minio.buckets.private, objectName };
    }
    if (prefix === this.config.tempDirName) {
      return { bucket: this.config.minio.buckets.temp, objectName };
    }

    throw new NotFoundException(`Unknown asset path prefix: ${prefix}`);
  }
}
