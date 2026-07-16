import { Injectable } from '@nestjs/common';
import { ValidationError } from 'app/common/response';
import { AuthUserValidatorUtil } from 'app/module/auth/utils/auth-user-validator.util';
import { TokenService } from 'app/module/auth/token.service';
import { OAUTH_ERROR_MESSAGES } from '../oauth.errors';
import { OauthRepository } from '../repository/oauth.repository';
import type { OauthRefreshTokenResponse } from '../types/oauth-response.type';

@Injectable()
export class OauthRefreshTokenUseCase {
  constructor(
    private readonly oauthRepository: OauthRepository,
    private readonly tokenService: TokenService,
    private readonly authUserValidator: AuthUserValidatorUtil,
  ) {}

  async execute(refreshToken: string): Promise<OauthRefreshTokenResponse> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.oauthRepository.findUserByIdAndRefreshToken(
      payload.id as string,
      refreshToken,
    );
    if (!user) {
      throw new ValidationError(OAUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const stores = await this.oauthRepository.listOwnedStores(user.id);

    this.authUserValidator.validateUserCanLogin(user);

    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
    });

    await this.oauthRepository.updateUserRefreshToken(
      user.id,
      tokens.refresh_token,
    );

    return { ...tokens, user, stores };
  }
}
