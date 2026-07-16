import { Module } from '@nestjs/common';
import { EmailQueueRepository } from './repository/email-queue.repository';
import { SendEmailUseCase } from './use-cases/send-email.use-case';
import { SendForgotPasswordEmailUseCase } from './use-cases/send-forgot-password-email.use-case';
import { SendVerificationEmailUseCase } from './use-cases/send-verification-email.use-case';
import { EmailTemplateRendererUtil } from './utils/email-template-renderer.util';

@Module({
  providers: [
    EmailQueueRepository,
    EmailTemplateRendererUtil,
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
  exports: [
    SendEmailUseCase,
    SendVerificationEmailUseCase,
    SendForgotPasswordEmailUseCase,
  ],
})
export class EmailModule {}
