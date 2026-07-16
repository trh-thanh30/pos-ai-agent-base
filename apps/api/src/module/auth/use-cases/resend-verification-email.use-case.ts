import { Injectable } from '@nestjs/common';
import { CodeService } from 'app/common/helpers/code.util';
import { NotFoundError, ValidationError } from 'app/common/response';
import { SendVerificationEmailUseCase } from 'app/module/email/use-cases/send-verification-email.use-case';
import type { EmailRequestDto } from '../dto/email-request.dto';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

@Injectable()
export class ResendVerificationEmailUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly codeService: CodeService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: EmailRequestDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }

    if (user.is_verified) {
      throw new ValidationError(this.errorMessages.EMAIL_ALREADY_VERIFIED);
    }

    const { code, expiredAt } = this.codeService.generateCodeWithExpiry();

    await this.authRepository.updateUser(user.id, {
      verification_code: code,
      verification_code_expired: expiredAt,
    });

    await this.sendVerificationEmailUseCase.execute({
      to: dto.email,
      code,
      ttl: expiredAt,
    });
  }
}
