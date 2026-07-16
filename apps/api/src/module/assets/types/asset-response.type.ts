import { asset_access_type, asset_type } from '@prisma/client';

export type AssetWithUrl = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  access_type: asset_access_type;
  type: asset_type;
  folder: string | null;
  metadata: Record<string, unknown> | null;
  is_deleted: boolean;
  uploaded_by_id: string | null;
  created_at: Date;
  updated_at: Date;
  url: string;
};
