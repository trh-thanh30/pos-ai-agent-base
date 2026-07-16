import type { Store } from '@prisma/client';

export interface AuthProfile {
  user: {
    id: string;
    email: string;
    username: string;
    status: string;
  };
  store: Store;
}
