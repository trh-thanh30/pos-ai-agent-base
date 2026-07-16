import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BcryptService } from 'app/common/helpers/bcrypt.util';
import { CodeService } from 'app/common/helpers/code.util';
import jwtConfig from 'app/config/jwt.config';
import { EmailModule } from 'app/module/email/email.module';
import { PrismaService } from 'app/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { TokenService } from './token.service';
import { UsersModule } from 'app/module/users/users.module';
import { AuthRepository } from './repository/auth.repository';
import { FindUserByRefreshTokenUseCase } from './use-cases/find-user-by-refresh-token.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { GetProfileUseCase } from './use-cases/get-profile.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from './use-cases/register-user.use-case';
import { ResendVerificationEmailUseCase } from './use-cases/resend-verification-email.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { SetCurrentStoreUseCase } from './use-cases/set-current-store.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { AuthErrorMessageUtil } from './utils/auth-error-message.util';
import { AuthUserValidatorUtil } from './utils/auth-user-validator.util';

@Module({
  controllers: [AuthController],
  providers: [
    PrismaService,
    CodeService,
    TokenService,
    BcryptService,
    AuthRepository,
    AuthErrorMessageUtil,
    AuthUserValidatorUtil,
    RegisterUserUseCase,
    LoginUseCase,
    VerifyEmailUseCase,
    ResendVerificationEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    FindUserByRefreshTokenUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    SetCurrentStoreUseCase,
  ],
  imports: [UsersModule, EmailModule, ConfigModule.forFeature(jwtConfig)],
  exports: [TokenService, AuthRepository, AuthUserValidatorUtil],
})
export class AuthModule {}
