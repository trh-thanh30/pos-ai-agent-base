import { ValidationError } from 'app/common/response';
import { ResetPasswordUseCase } from '../use-cases/reset-password.use-case';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

describe('ResetPasswordUseCase', () => {
  it('updates password and clears reset metadata', async () => {
    const authRepository = {
      findUserByPasswordResetCode: jest.fn().mockResolvedValue({
        id: 'user-1',
        password_reset_code_expired: new Date('2026-01-01T00:05:00Z'),
      }),
      updateUser: jest.fn().mockResolvedValue(undefined),
    };
    const bcryptService = {
      hashPassword: jest.fn().mockResolvedValue('new-hashed-password'),
    };
    const authUserValidator = {
      isCodeExpired: jest.fn().mockReturnValue(false),
    };
    const useCase = new ResetPasswordUseCase(
      authRepository as never,
      bcryptService as never,
      authUserValidator as never,
      new AuthErrorMessageUtil(),
    );

    await useCase.execute({
      resetToken: '123456',
      password: 'new-password',
      confirmPassword: 'new-password',
    });

    expect(authRepository.updateUser).toHaveBeenCalledWith('user-1', {
      password: 'new-hashed-password',
      password_reset_code: null,
      password_reset_code_expired: null,
      refresh_token: null,
    });
  });

  it('rejects expired reset token and clears it', async () => {
    const authRepository = {
      findUserByPasswordResetCode: jest.fn().mockResolvedValue({
        id: 'user-1',
        password_reset_code_expired: new Date('2026-01-01T00:00:00Z'),
      }),
      updateUser: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new ResetPasswordUseCase(
      authRepository as never,
      { hashPassword: jest.fn() } as never,
      { isCodeExpired: jest.fn().mockReturnValue(true) } as never,
      new AuthErrorMessageUtil(),
    );

    await expect(
      useCase.execute({
        resetToken: '123456',
        password: 'new-password',
        confirmPassword: 'new-password',
      }),
    ).rejects.toThrow(ValidationError);
    expect(authRepository.updateUser).toHaveBeenCalledWith('user-1', {
      password_reset_code: null,
      password_reset_code_expired: null,
    });
  });
});
