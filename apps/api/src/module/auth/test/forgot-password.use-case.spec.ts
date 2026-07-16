jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id'),
}));

import { NotFoundError } from 'app/common/response';
import { ForgotPasswordUseCase } from '../use-cases/forgot-password.use-case';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

describe('ForgotPasswordUseCase', () => {
  it('updates reset code and enqueues forgot password email', async () => {
    const expiredAt = new Date('2026-01-01T02:00:00Z');
    const authRepository = {
      findUserByEmail: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
      }),
      updateUser: jest.fn().mockResolvedValue({ id: 'user-1' }),
    };
    const codeService = {
      generateCodeWithExpiry: jest
        .fn()
        .mockReturnValue({ code: '654321', expiredAt }),
    };
    const sendForgotPasswordEmailUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, jobId: 'job-1' }),
    };
    const useCase = new ForgotPasswordUseCase(
      authRepository as never,
      codeService as never,
      sendForgotPasswordEmailUseCase as never,
      new AuthErrorMessageUtil(),
    );

    await useCase.execute({ email: 'user@example.com' });

    expect(codeService.generateCodeWithExpiry).toHaveBeenCalledWith(6, 2);
    expect(authRepository.updateUser).toHaveBeenCalledWith('user-1', {
      password_reset_code: '654321',
      password_reset_code_expired: expiredAt,
    });
    expect(sendForgotPasswordEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      code: '654321',
      ttl: expiredAt,
    });
  });

  it('rejects unknown email before updating reset code', async () => {
    const authRepository = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
      updateUser: jest.fn(),
    };
    const useCase = new ForgotPasswordUseCase(
      authRepository as never,
      { generateCodeWithExpiry: jest.fn() } as never,
      { execute: jest.fn() } as never,
      new AuthErrorMessageUtil(),
    );

    await expect(
      useCase.execute({ email: 'missing@example.com' }),
    ).rejects.toThrow(NotFoundError);
    expect(authRepository.updateUser).not.toHaveBeenCalled();
  });
});
