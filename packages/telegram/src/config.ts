import { TelegramConfig } from './types';
import { z } from 'zod';

export const defaultConfig: TelegramConfig = {
    botToken: process.env.CI_TELEGRAM_BOT_TOKEN || '',
    recipientId: process.env.CI_TELEGRAM_CHAT_ID || '',
    defaultParseMode: 'HTML',
};

const validateConfig = (config: TelegramConfig) => {
    const schema = z.object({
        botToken: z.string().min(1),
        recipientId: z.string().min(1),
        defaultParseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).default('HTML'),
    });
    const result = schema.safeParse(config);
    if (!result.success) {
        throw new Error('Invalid telegram config: ' + result.error.message);
    }
    return result.data;
};

export function createTelegramConfig(config: Partial<TelegramConfig> = {}): TelegramConfig {
    return validateConfig({
        ...defaultConfig,
        ...config,
    });
} 
