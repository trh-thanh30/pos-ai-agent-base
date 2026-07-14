import type { TelegramStatus } from '../telegram-notify.types';

export const statusLabels: Record<TelegramStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  running: 'Running',
  cancelled: 'Cancelled',
};

export const statusSymbols: Record<TelegramStatus, string> = {
  success: 'SUCCESS',
  failed: 'FAILED',
  running: 'RUNNING',
  cancelled: 'CANCELLED',
};
