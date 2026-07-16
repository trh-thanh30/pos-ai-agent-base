import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { EmailQueueService } from '@repo/email';
import emailConfig from 'app/config/email.config';
import type { QueueEmailParams } from '../types/queue-email-params.type';

@Injectable()
export class EmailQueueRepository {
  private readonly logger = new Logger(EmailQueueRepository.name);
  private readonly queueService: EmailQueueService;

  constructor(
    @Inject(emailConfig.KEY)
    private readonly config: ConfigType<typeof emailConfig>,
  ) {
    const redisPort = Number(
      process.env.REDIS_DEV_PORT || process.env.REDIS_PORT || 6379,
    );

    this.queueService = new EmailQueueService({
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: this.config.smtpUser,
      password: this.config.smtpPass,
      notificationEmail: process.env.EMAIL_NOTI || this.config.smtpUser,
      defaultFrom: this.config.smtpFrom,
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: redisPort,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    });
  }

  async enqueueHtmlEmail(params: QueueEmailParams) {
    const result = await this.queueService.sendEmail(params.html, {
      to: params.to,
      subject: params.subject,
      from: params.from || this.config.smtpFrom,
      priority: params.priority || 'medium',
    });

    if (!result.success) {
      this.logger.error(
        `Failed to enqueue email to ${params.to}: ${result.error || 'unknown error'}`,
      );
      throw new Error(result.error || 'Failed to enqueue email');
    }

    this.logger.log(
      `Email job enqueued to ${params.to} with subject "${params.subject}"`,
    );
    return result;
  }
}
