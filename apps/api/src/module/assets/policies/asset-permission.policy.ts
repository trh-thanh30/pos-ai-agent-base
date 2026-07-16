import { Injectable } from '@nestjs/common';
import { Asset, asset_access_type, user_role } from '@prisma/client';
import { type IUser } from 'app/common/types/user.type';

export type AssetPermissionAction = 'READ' | 'WRITE' | 'DELETE';

@Injectable()
export class AssetPermissionPolicy {
  can(asset: Asset, user: IUser, action: AssetPermissionAction): boolean {
    if (user.role === user_role.ADMIN) return true;
    if (asset.uploaded_by_id === user.id) return true;

    if (action === 'READ') {
      if (asset.access_type === asset_access_type.PUBLIC) return true;
      if (asset.access_type === asset_access_type.TEMP) return true;
    }

    return false;
  }
}
