import { Injectable } from '@nestjs/common';
import type { Store } from '@prisma/client';
import { ForbiddenError, NotFoundError } from 'app/common/response';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import { AuthUserValidatorUtil } from '../utils/auth-user-validator.util';
import { TokenService } from '../token.service';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly authUserValidator: AuthUserValidatorUtil,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.authRepository.findUserByIdAndRefreshToken(
      payload.id as string,
      refreshToken,
    );
    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }

    let store: Store | null = null;
    if (payload.storeId) {
      store = await this.authRepository.findStoreById(payload.storeId as string);
    } else {
      store = await this.authRepository.findFirstOwnedStore(payload.id as string);
    }

    if (store) {
      const memberShip = await this.authRepository.findStoreMember(
        payload.id as string,
        store.id,
      );
      if (!memberShip && store.owner_id !== payload.id) {
        throw new ForbiddenError(this.errorMessages.NOT_STORE_MEMBER);
      }
    }

    this.authUserValidator.validateUserCanLogin(user);

    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
      storeId: store?.id,
    });

    await this.authRepository.updateUserRefreshToken(
      user.id,
      tokens.refresh_token,
    );

    return { ...tokens, user, store };
  }
}
