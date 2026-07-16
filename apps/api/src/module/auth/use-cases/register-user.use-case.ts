import { Injectable } from '@nestjs/common';
import { BcryptService } from 'app/common/helpers/bcrypt.util';
import { CodeService } from 'app/common/helpers/code.util';
import { ConflictError } from 'app/common/response';
import { SendVerificationEmailUseCase } from 'app/module/email/use-cases/send-verification-email.use-case';
import type { RegisterDto } from '../dto/register.dto';
import { AuthRepository } from '../repository/auth.repository';
import type { RegisterResponse } from '../types/auth-response.type';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly bcryptService: BcryptService,
    private readonly codeService: CodeService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly errorMessages: AuthErrorMessageUtil,
  ) {}

  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    await this.validateUserDoesNotExist(dto.email, dto.username);

    const { code, expiredAt } = this.codeService.generateCodeWithExpiry();
    const hashedPassword = await this.bcryptService.hashPassword(dto.password);

    const user = await this.authRepository.createUser({
      email: dto.email,
      username: dto.username,
      password: hashedPassword,
      verification_code: code,
      verification_code_expired: expiredAt,
    });

    await this.sendVerificationEmailUseCase.execute({
      to: dto.email,
      code,
      ttl: expiredAt,
    });

    return { user };
  }

  private async validateUserDoesNotExist(email: string, username: string) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.authRepository.findUserByEmail(email),
      this.authRepository.findUserByUsername(username),
    ]);

    if (existingEmail) {
      throw new ConflictError(this.errorMessages.EMAIL_ALREADY_EXISTS);
    }

    if (existingUsername) {
      throw new ConflictError(this.errorMessages.USERNAME_ALREADY_EXISTS);
    }
  }
}
