import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { user_status } from '@prisma/client';
import { ValidationError } from 'app/common/response';
import { CodeService } from 'app/common/helpers/code.util';
import { AuthErrorMessageUtil } from './auth-error-message.util';

@Injectable()
export class AuthUserValidatorUtil {
  constructor(
    private readonly codeService: CodeService,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  validateVerificationCode(user: User, code: string) {
    if (user.verification_code !== code) {
      throw new ValidationError(this.errorMessages.INVALID_VALIDATION_CODE);
    }

    if (
      !user.verification_code_expired ||
      this.codeService.isCodeExpired(user.verification_code_expired)
    ) {
      throw new ValidationError(this.errorMessages.CODE_EXPIRED);
    }
  }

  validateUserCanLogin(user: User) {
    if (!user.is_verified) {
      throw new ValidationError(this.errorMessages.EMAIL_NOT_VERIFIED);
    }

    if (user.status !== user_status.ACTIVE) {
      throw new ValidationError(this.errorMessages.ACCOUNT_INACTIVE);
    }
  }

  isCodeExpired(date: Date) {
    return this.codeService.isCodeExpired(date);
  }
}
