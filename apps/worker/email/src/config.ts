import { EmailConfig } from '@repo/email';
import { createLogger, LoggerConfigOptions, LoggerInstance } from '@repo/logger';

/**
 * Configuration for the BullMQ queue and worker specific to emails.
 */
export interface WorkerQueueConfig {
  name: string;
  concurrency: number;
  limiter?: {
    max: number;
    duration: number;
  };
  removeOnComplete?: {
    count: number; // Keep last X jobs
    age?: number; // Keep jobs for Y seconds
  };
  removeOnFail?: {
    count: number;
    age?: number;
  };
}

/**
 * Configuration for the Email Worker application.
 */
export interface EmailWorkerConfig {
  // Directly include fields that make up ConnectionOptions for BullMQ
  redisHost: string;
  redisPort: number;
  redisPassword?: string;
  // Add other ConnectionOptions fields here if needed, e.g., db, family, etc.
  // For simplicity, keeping it to host, port, password for now.

  worker: WorkerQueueConfig;
  emailService: EmailConfig;
  defaultFromEmail?: string;
  adminEmail?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  loki?: {
    url: string;
    username?: string;
    password?: string;
    labels?: Record<string, string>;
  };
}

const DEFAULT_WORKER_QUEUE_NAME = 'email-notifications';
const DEFAULT_CONCURRENCY = 5;

/**
 * Creates the configuration for the Email Worker.
 * Merges default values with provided partial configuration and environment variables.
 */
export function createWorkerConfig(config: Partial<EmailWorkerConfig> = {}): EmailWorkerConfig {
  const redisPortVal = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : (process.env.REDIS_DEV_PORT ? parseInt(process.env.REDIS_DEV_PORT, 10) : 6379);
  return {
    redisHost: process.env.REDIS_HOST || config.redisHost || 'localhost',
    redisPort: redisPortVal || config.redisPort || 6379,
    redisPassword: process.env.REDIS_PASSWORD || config.redisPassword,
    worker: {
      name: config.worker?.name || DEFAULT_WORKER_QUEUE_NAME,
      concurrency: config.worker?.concurrency || DEFAULT_CONCURRENCY,
      removeOnComplete: config.worker?.removeOnComplete || { count: 100, age: 24 * 3600 },
      removeOnFail: config.worker?.removeOnFail || { count: 1000, age: 7 * 24 * 3600 },
      limiter: config.worker?.limiter,
    },
    emailService: {
      service: process.env.EMAIL_SERVICE || config.emailService?.service || 'gmail',
      user: process.env.SMTP_USER || process.env.EMAIL_USER || config.emailService?.user || '',
      password: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || config.emailService?.password || '',
      defaultFrom: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || config.emailService?.defaultFrom || 'noreply@example.com',
      templatePath: config.emailService?.templatePath || './email-templates',
      notificationEmail: process.env.EMAIL_NOTI || config.emailService?.notificationEmail || 'admin@example.com',
    },
    defaultFromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.EMAIL_USER || config.defaultFromEmail,
    adminEmail: process.env.EMAIL_NOTI || config.adminEmail,
    logLevel: (process.env.LOG_LEVEL as EmailWorkerConfig['logLevel']) || config.logLevel || 'info',
    loki: {
      url: process.env.LOKI_URL || config.loki?.url || 'http://localhost:7100',
      username: process.env.LOKI_USERNAME || config.loki?.username,
      password: process.env.LOKI_PASSWORD || config.loki?.password,
      labels: { service: 'email-workers', ...(config.loki?.labels || {}) },
    },
  };
}

/**
 * Logger for the Email Worker.
 */
export const logger: LoggerInstance = createLogger({
  serviceName: 'EmailWorker',
  enableConsole: true,
  enableLoki: process.env.ENABLE_LOKI === 'true',
  logLevel: (process.env.LOG_LEVEL || 'info') as LoggerConfigOptions['logLevel'],
  env: (process.env.NODE_ENV || 'development') as LoggerConfigOptions['env'],
  defaultMeta: {
    component: 'email-worker-core',
    version: process.env.npm_package_version,
  },
  enableFile: false,
  filePath: './logs/email-worker.log',
  loki: {
    url: process.env.LOKI_URL || 'http://localhost:7100',
    username: process.env.LOKI_USERNAME,
    password: process.env.LOKI_PASSWORD,
    labels: { service: 'email-workers' },
    batchInterval: 5000,
    batchSize: 100,
  },
});
