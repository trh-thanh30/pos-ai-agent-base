import { Injectable } from '@nestjs/common';
import { provider_type } from '@prisma/client';
import { GoogleProfile } from 'app/common/types/google-profile.type';
import { TokenService } from 'app/module/auth/token.service';
import { OauthRepository } from '../repository/oauth.repository';
import type { OauthLoginResponse } from '../types/oauth-response.type';

@Injectable()
export class ValidateOauthUseCase {
  constructor(
    private readonly oauthRepository: OauthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(profile: GoogleProfile): Promise<OauthLoginResponse> {
    const { id, emails, name, displayName } = profile;

    const email = emails[0]?.value;
    const firstName = name?.givenName || '';
    const lastName = name?.familyName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    let user = await this.oauthRepository.findUserByEmail(email);

    if (!user) {
      user = await this.oauthRepository.createUser({
        email,
        username: fullName || displayName,
        provider_id: id,
        is_verified: true,
        provider: provider_type.GOOGLE,
        lastLoginAt: new Date(),
      });
    }

    const tokenPair = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
    });

    await this.oauthRepository.updateUserRefreshToken(
      user.id,
      tokenPair.refresh_token,
    );

    const store = await this.oauthRepository.findFirstOwnedStore(user.id);

    return {
      user,
      ...tokenPair,
      hasStore: !!store,
    };
  }
}
