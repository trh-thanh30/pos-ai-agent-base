import { Injectable } from '@nestjs/common';
import { EmailQueueRepository } from '../repository/email-queue.repository';
import type { QueueEmailParams } from '../types/queue-email-params.type';

@Injectable()
export class SendEmailUseCase {
  constructor(private readonly emailQueueRepository: EmailQueueRepository) {}

  async execute(params: QueueEmailParams) {
    return this.emailQueueRepository.enqueueHtmlEmail(params);
  }
}
