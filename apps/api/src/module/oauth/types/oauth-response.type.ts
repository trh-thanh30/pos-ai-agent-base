import type { Store, User } from '@prisma/client';

export interface OauthLoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  hasStore: boolean;
}

export interface OauthRefreshTokenResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  stores: Store[];
}
