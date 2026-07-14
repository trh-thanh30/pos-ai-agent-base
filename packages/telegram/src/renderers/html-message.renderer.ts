import type { CiCdNotificationPayload } from '../telegram-notify.types';
import { renderCiMessage } from '../templates/ci-message.template';
import { renderDeployMessage } from '../templates/deploy-message.template';

export function renderTelegramHtmlMessage(payload: CiCdNotificationPayload): string {
  return payload.event === 'deploy' ? renderDeployMessage(payload) : renderCiMessage(payload);
}
