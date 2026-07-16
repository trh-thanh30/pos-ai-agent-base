import { Injectable } from '@nestjs/common';
import { BcryptService } from 'app/common/helpers/bcrypt.util';
import { NotFoundError, ValidationError } from 'app/common/response';
import type { LoginDto } from '../dto/login.dto';
import { AuthRepository } from '../repository/auth.repository';
import type { AuthResponse } from '../types/auth-response.type';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import { AuthUserValidatorUtil } from '../utils/auth-user-validator.util';
import { TokenService } from '../token.service';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly bcryptService: BcryptService,
    private readonly tokenService: TokenService,
    private readonly authUserValidator: AuthUserValidatorUtil,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.authRepository.findUserByEmailOrUsername(
      dto.usernameOrEmail,
    );

    if (!user?.password) {
      throw new NotFoundError(this.errorMessages.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.bcryptService.comparePassword(
      dto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError(this.errorMessages.INVALID_CREDENTIALS);
    }

    this.authUserValidator.validateUserCanLogin(user);

    const stores = [
      ...user.ownedStores.map((store) => ({
        ...store,
        membersCount: store._count.members,
      })),
      ...user.memberships.map((membership) => ({
        ...membership.store,
        membersCount: membership.store._count.members,
      })),
    ];

    const tokens = this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      username: user.username,
    });

    await this.authRepository.updateUserRefreshToken(
      user.id,
      tokens.refresh_token,
    );

    return {
      ...tokens,
      user,
      stores,
    };
  }
}
