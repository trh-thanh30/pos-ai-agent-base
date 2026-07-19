import { createEmailConfig } from '@repo/email';

const baseConfig = {
  service: 'gmail',
  user: 'sender@example.com',
  password: 'app-password',
  notificationEmail: 'notifications@example.com',
};

describe('Email sender config', () => {
  it('accepts a plain sender email', () => {
    const config = createEmailConfig({
      ...baseConfig,
      defaultFrom: 'sender@example.com',
    });

    expect(config.defaultFrom).toBe('sender@example.com');
  });

  it('accepts and preserves a sender display address', () => {
    const config = createEmailConfig({
      ...baseConfig,
      defaultFrom: 'EraPOS Agent <sender@example.com>',
    });

    expect(config.defaultFrom).toBe('EraPOS Agent <sender@example.com>');
  });

  it('rejects invalid or multiple sender addresses', () => {
    expect(() =>
      createEmailConfig({ ...baseConfig, defaultFrom: 'EraPOS Agent' }),
    ).toThrow('Invalid email config');
    expect(() =>
      createEmailConfig({
        ...baseConfig,
        defaultFrom: 'sender@example.com, other@example.com',
      }),
    ).toThrow('Invalid email config');
  });
});
