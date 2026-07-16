import { Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from 'app/common/response';
import type { VerifyEmailDto } from '../dto/verify-email.dto';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import { AuthUserValidatorUtil } from '../utils/auth-user-validator.util';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authUserValidator: AuthUserValidatorUtil,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: VerifyEmailDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }

    if (user.is_verified) {
      throw new ValidationError(this.errorMessages.EMAIL_ALREADY_VERIFIED);
    }

    this.authUserValidator.validateVerificationCode(user, dto.verificationCode);

    await this.authRepository.updateUser(user.id, {
      verification_code: null,
      verification_code_expired: null,
      is_verified: true,
    });
  }
}
