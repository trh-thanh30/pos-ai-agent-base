import path from 'path';
import addressparser from 'nodemailer/lib/addressparser';
import { z } from 'zod';

import { EmailConfig } from './types';

const emailSchema = z.string().email();

const senderSchema = z
  .string()
  .min(1)
  .superRefine((value, context) => {
    let addresses: Array<{ name: string; address: string }>;

    try {
      addresses = addressparser(value, { flatten: true });
    } catch {
      addresses = [];
    }

    if (
      addresses.length !== 1 ||
      !emailSchema.safeParse(addresses[0]?.address).success
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Sender must be an email or a display address such as Name <email@example.com>',
      });
    }
  });

export const defaultConfig: EmailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
  password: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '',
  notificationEmail: process.env.EMAIL_NOTI || process.env.SMTP_USER || '',
  templatePath: path.join(process.cwd(), 'templates'),
  defaultFrom:
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    '',
};

const validateConfig = (config: EmailConfig) => {
  const schema = z.object({
    service: z.string().min(1).default('gmail'),
    user: z.string().email(),
    password: z.string().min(1),
    notificationEmail: z.string().email(),
    templatePath: z.string().optional(),
    defaultFrom: senderSchema,
  });
  const result = schema.safeParse(config);
  if (!result.success) {
    throw new Error('Invalid email config: ' + result.error.message);
  }
  return result.data;
};

export function createEmailConfig(
  config: Partial<EmailConfig> = {},
): EmailConfig {
  return validateConfig({
    ...defaultConfig,
    ...config,
  });
}
