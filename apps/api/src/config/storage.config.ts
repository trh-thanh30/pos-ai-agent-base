import { registerAs } from '@nestjs/config';

/**
 * Storage & Asset configuration
 * Reads from environment variables (validated by Zod in env.validation.ts)
 */
export default registerAs('storage', () => ({
  driver: process.env.STORAGE_DRIVER ?? 'minio',
  rootDir: process.env.STORAGE_ROOT_DIR ?? './storage',
  publicDirName: process.env.STORAGE_PUBLIC_DIR_NAME ?? 'public',
  privateDirName: process.env.STORAGE_PRIVATE_DIR_NAME ?? 'private',
  tempDirName: process.env.STORAGE_TEMP_DIR_NAME ?? 'temp',
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '19000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    buckets: {
      public: process.env.MINIO_BUCKET_PUBLIC ?? 'pos-system-public',
      private: process.env.MINIO_BUCKET_PRIVATE ?? 'pos-system-private',
      temp: process.env.MINIO_BUCKET_TEMP ?? 'pos-system-temp',
    },
  },
  cdnUrl: (
    process.env.ASSET_CDN_URL ?? 'http://localhost:19000/pos-system-public'
  ).replace(/\/$/, ''),
  maxFileSize: parseInt(process.env.ASSET_MAX_FILE_SIZE ?? '10485760', 10),
  allowedMimeTypes: (
    process.env.ASSET_ALLOWED_MIME_TYPES ??
    'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/quicktime,audio/mpeg,audio/wav,application/pdf'
  ).split(','),
}));
