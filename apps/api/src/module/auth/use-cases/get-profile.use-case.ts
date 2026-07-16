import { Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from 'app/common/response';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import type { AuthProfile } from '../types/auth-profile.type';

@Injectable()
export class GetProfileUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(userId: string, storeId: string): Promise<AuthProfile> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }

    const store = await this.authRepository.findStoreById(storeId);
    if (!store) {
      throw new NotFoundError(this.errorMessages.STORE_NOT_FOUND);
    }

    const memberShip = await this.authRepository.findStoreMember(
      userId,
      storeId,
    );
    if (!memberShip && store.owner_id !== userId) {
      throw new ForbiddenError(this.errorMessages.NOT_STORE_MEMBER);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        status: user.status,
      },
      store,
    };
  }
}
