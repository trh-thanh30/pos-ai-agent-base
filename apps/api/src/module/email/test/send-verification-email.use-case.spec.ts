import { SendVerificationEmailUseCase } from '../use-cases/send-verification-email.use-case';

describe('SendVerificationEmailUseCase', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders verification template and enqueues a high priority email', async () => {
    const sendEmailUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, jobId: 'job-1' }),
    };
    const renderer = {
      render: jest.fn().mockReturnValue('<html>123456</html>'),
    };
    const useCase = new SendVerificationEmailUseCase(
      sendEmailUseCase as never,
      renderer as never,
    );

    await useCase.execute({
      to: 'user@example.com',
      code: '123456',
      ttl: new Date('2026-01-01T00:05:00Z'),
    });

    expect(renderer.render).toHaveBeenCalledWith('verification', {
      code: '123456',
      ttl: 5,
    });
    expect(sendEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Verify your email',
      html: '<html>123456</html>',
      priority: 'high',
    });
  });
});
