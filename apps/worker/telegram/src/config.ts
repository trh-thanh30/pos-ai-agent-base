
import type { QueueConfig, WorkerConfig } from '@repo/dto';
import { createLogger, LoggerConfigOptions, LoggerInstance } from '@repo/logger';

export interface TelegramWorkerConfig {
    botToken: string;
    defaultRecipientId: string;
    adminChatId?: number;
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    queue: QueueConfig;
    worker: WorkerConfig;
}

export const defaultConfig: TelegramWorkerConfig = {
    botToken: process.env.CI_TELEGRAM_BOT_TOKEN || '',
    defaultRecipientId: process.env.CI_TELEGRAM_CHAT_ID || '',
    adminChatId: process.env.CI_TELEGRAM_CHAT_ID ? parseInt(process.env.CI_TELEGRAM_CHAT_ID, 10) : undefined,
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : (process.env.REDIS_DEV_PORT ? parseInt(process.env.REDIS_DEV_PORT, 10) : 6379),
        password: process.env.REDIS_PASSWORD
    },
    queue: {
        name: 'telegram-notifications',
        prefix: 'pos',
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: 100,
            removeOnFail: 1000
        }
    },
    worker: {
        name: 'telegram-notifications',
        prefix: 'pos',
        concurrency: 5,
        limiter: {
            max: 30,
            duration: 1000
        }
    }
};

export const logger: LoggerInstance = createLogger({ 
    serviceName: 'TelegramWorker',
    enableConsole: true,
    enableLoki: process.env.ENABLE_LOKI === 'true',
    logLevel: (process.env.LOG_LEVEL || 'info') as LoggerConfigOptions['logLevel'],
    env: (process.env.NODE_ENV || 'development') as LoggerConfigOptions['env'],
    defaultMeta: {
        component: 'worker',
        version: process.env.npm_package_version
    },
    enableFile: false,
    filePath: './logs/telegram-worker.log',
    loki: {
        url: process.env.LOKI_URL || 'http://localhost:7100',
        username: process.env.LOKI_USERNAME,
        password: process.env.LOKI_PASSWORD,
        labels: {
            service: 'telegram-workers',
            environment: process.env.NODE_ENV || 'development'
        },
        batchInterval: 5000,
        batchSize: 100,
    }
});

export function createWorkerConfig(config: Partial<TelegramWorkerConfig> = {}): TelegramWorkerConfig {
    return {
        ...defaultConfig,
        ...config,
        redis: {
            ...defaultConfig.redis,
            ...config.redis
        },
        queue: {
            ...defaultConfig.queue,
            ...config.queue
        },
        worker: {
            ...defaultConfig.worker,
            ...config.worker
        }
    };
} 
