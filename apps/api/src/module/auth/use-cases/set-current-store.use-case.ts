import { Injectable } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from 'app/common/response';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import { TokenService } from '../token.service';

@Injectable()
export class SetCurrentStoreUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(userId: string, storeId: string) {
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

    const token = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      status: user.status,
      storeId: store.id,
      storeRole: memberShip?.role,
    });

    await this.authRepository.updateUserRefreshToken(
      user.id,
      token.refresh_token,
    );

    return {
      ...token,
      store,
    };
  }
}
