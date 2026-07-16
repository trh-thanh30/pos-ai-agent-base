import { Injectable } from '@nestjs/common';
import { NotFoundError } from 'app/common/response';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

@Injectable()
export class FindUserByRefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(refreshToken: string) {
    const user = await this.authRepository.findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }
    return user;
  }
}
