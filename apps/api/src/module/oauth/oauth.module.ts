import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'app/module/auth/auth.module';
import { PrismaService } from 'app/prisma/prisma.service';
import { GoogleStrategy } from 'app/strategy/google.strategy';
import { TokenService } from '../auth/token.service';
import { OauthController } from './oauth.controller';
import { OauthRepository } from './repository/oauth.repository';
import { OauthRefreshTokenUseCase } from './use-cases/oauth-refresh-token.use-case';
import { ValidateOauthUseCase } from './use-cases/validate-oauth.use-case';
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'google' }), AuthModule],
  controllers: [OauthController],
  providers: [
    PrismaService,
    OauthRepository,
    ValidateOauthUseCase,
    OauthRefreshTokenUseCase,
    TokenService,
    GoogleStrategy,
  ],
})
export class OauthModule {}
