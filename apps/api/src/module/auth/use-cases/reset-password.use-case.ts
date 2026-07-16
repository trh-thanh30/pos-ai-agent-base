import { Injectable } from '@nestjs/common';
import { BcryptService } from 'app/common/helpers/bcrypt.util';
import { ValidationError } from 'app/common/response';
import type { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';
import { AuthUserValidatorUtil } from '../utils/auth-user-validator.util';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly bcryptService: BcryptService,
    private readonly authUserValidator: AuthUserValidatorUtil,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: ResetPasswordDto) {
    const user = await this.authRepository.findUserByPasswordResetCode(
      dto.resetToken,
    );

    if (!user) {
      throw new ValidationError(this.errorMessages.INVALID_VALIDATION_CODE);
    }

    if (
      !user.password_reset_code_expired ||
      this.authUserValidator.isCodeExpired(user.password_reset_code_expired)
    ) {
      await this.clearPasswordResetCode(user.id);
      throw new ValidationError(this.errorMessages.CODE_EXPIRED);
    }

    const hashedPassword = await this.bcryptService.hashPassword(dto.password);

    await this.authRepository.updateUser(user.id, {
      password: hashedPassword,
      password_reset_code: null,
      password_reset_code_expired: null,
      refresh_token: null,
    });
  }

  private async clearPasswordResetCode(userId: string) {
    await this.authRepository.updateUser(userId, {
      password_reset_code: null,
      password_reset_code_expired: null,
    });
  }
}
