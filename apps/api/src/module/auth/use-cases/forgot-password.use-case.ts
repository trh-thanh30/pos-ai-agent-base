import { Injectable } from '@nestjs/common';
import { CodeService } from 'app/common/helpers/code.util';
import { NotFoundError } from 'app/common/response';
import { SendForgotPasswordEmailUseCase } from 'app/module/email/use-cases/send-forgot-password-email.use-case';
import type { EmailRequestDto } from '../dto/email-request.dto';
import { AuthRepository } from '../repository/auth.repository';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly codeService: CodeService,
    private readonly sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: EmailRequestDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new NotFoundError(this.errorMessages.USER_NOT_FOUND);
    }

    const { code, expiredAt } = this.codeService.generateCodeWithExpiry(6, 2);

    await this.authRepository.updateUser(user.id, {
      password_reset_code: code,
      password_reset_code_expired: expiredAt,
    });

    await this.sendForgotPasswordEmailUseCase.execute({
      to: dto.email,
      code,
      ttl: expiredAt,
    });
  }
}
