import type { TelegramNotifyConfig, TelegramSendMessageInput } from './telegram-notify.types';

export class TelegramNotifyClient {
  private readonly apiBaseUrl: string;

  constructor(private readonly config: TelegramNotifyConfig) {
    this.apiBaseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  async sendMessage(input: TelegramSendMessageInput): Promise<void> {
    const body: Record<string, unknown> = {
      chat_id: this.config.chatId,
      text: input.text,
      parse_mode: 'HTML',
      disable_web_page_preview: input.disableWebPagePreview ?? false,
      disable_notification: this.config.disableNotification ?? false,
    };

    if (this.config.messageThreadId) {
      body.message_thread_id = Number(this.config.messageThreadId);
    }

    await this.request('sendMessage', body);
  }

  private async request(method: string, body: Record<string, unknown>): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) return;

    const error = await response.text();
    throw new Error(`Telegram API request failed with ${response.status}: ${error}`);
  }
}
