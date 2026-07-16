import type { Store, User } from '@prisma/client';

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  stores?: Store[];
}

export interface RegisterResponse {
  user: User;
}
