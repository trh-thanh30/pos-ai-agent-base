import { Asset, asset_access_type, user_role } from '@prisma/client';
import { IUser } from 'app/common/types/user.type';
import { AssetPermissionPolicy } from '../policies/asset-permission.policy';

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
    expect(
      policy.can(
        { ...mockAsset },
        { ...mockUser, role: user_role.ADMIN },
        'DELETE',
      ),
    ).toBe(true);
  });

  it('allows owner to do anything', () => {
    expect(policy.can(mockAsset, mockUser, 'DELETE')).toBe(true);
  });

  it('allows anyone to read public assets', () => {
    expect(policy.can(mockAsset, { ...mockUser, id: 'user-2' }, 'READ')).toBe(
      true,
    );
  });

  it('does not allow other users to delete assets', () => {
    expect(policy.can(mockAsset, { ...mockUser, id: 'user-2' }, 'DELETE')).toBe(
      false,
    );
  });

  it('does not allow other users to read private assets', () => {
    expect(
      policy.can(
        { ...mockAsset, access_type: asset_access_type.PRIVATE },
        { ...mockUser, id: 'user-2' },
        'READ',
      ),
    ).toBe(false);
  });
});
