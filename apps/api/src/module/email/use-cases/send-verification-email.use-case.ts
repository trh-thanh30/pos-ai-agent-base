import { Injectable } from '@nestjs/common';
import { EmailTemplateRendererUtil } from '../utils/email-template-renderer.util';
import { SendEmailUseCase } from './send-email.use-case';
import type { AuthEmailParams } from '../types/auth-email-params.type';

@Injectable()
export class SendVerificationEmailUseCase {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly renderer: EmailTemplateRendererUtil,
  ) {}

  async execute(params: AuthEmailParams) {
    const html = this.renderer.render('verification', {
      code: params.code,
      ttl: this.getMinutes(params.ttl),
    });

    return this.sendEmailUseCase.execute({
      to: params.to,
      subject: 'Verify your email',
      html,
      priority: 'high',
    });
  }

  private getMinutes(date: Date) {
    const now = new Date();
    return Math.max(0, Math.round((date.getTime() - now.getTime()) / 60000));
  }
}
