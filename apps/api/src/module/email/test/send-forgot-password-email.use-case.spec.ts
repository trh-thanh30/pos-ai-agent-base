import { SendForgotPasswordEmailUseCase } from '../use-cases/send-forgot-password-email.use-case';

describe('SendForgotPasswordEmailUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders forgot password template and enqueues a high priority email', async () => {
    const sendEmailUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, jobId: 'job-1' }),
    };
    const renderer = {
      render: jest.fn().mockReturnValue('<html>654321</html>'),
    };
    const useCase = new SendForgotPasswordEmailUseCase(
      sendEmailUseCase as never,
      renderer as never,
    );

    await useCase.execute({
      to: 'user@example.com',
      code: '654321',
      ttl: new Date('2026-01-01T00:02:00Z'),
    });

    expect(renderer.render).toHaveBeenCalledWith('forgot-password', {
      code: '654321',
      ttl: 2,
    });
    expect(sendEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Reset your password',
      html: '<html>654321</html>',
      priority: 'high',
    });
  });
});
