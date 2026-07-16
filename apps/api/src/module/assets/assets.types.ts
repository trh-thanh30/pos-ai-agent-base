import { asset_type } from '@prisma/client';

export function determineAssetType(mime: string): asset_type {
  if (mime.startsWith('image/')) return asset_type.IMAGE;
  if (mime.startsWith('video/')) return asset_type.VIDEO;
  if (mime.startsWith('audio/')) return asset_type.AUDIO;
  if (mime === 'application/pdf' || mime.includes('document')) {
    return asset_type.DOCUMENT;
  }
  return asset_type.OTHER;
}
