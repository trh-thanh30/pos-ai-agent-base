export interface QueueEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  priority?: 'high' | 'medium' | 'low';
}
