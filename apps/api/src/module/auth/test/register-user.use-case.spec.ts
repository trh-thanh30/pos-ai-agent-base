jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mock-id'),
}));

import { ConflictError } from 'app/common/response';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

describe('RegisterUserUseCase', () => {
  it('creates user with verification code and enqueues verification email', async () => {
    const expiredAt = new Date('2026-01-01T00:05:00Z');
    const authRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByUsername: jest.fn().mockResolvedValue(null),
      findUserByEmail: jest.fn().mockResolvedValue(null),
      findUserByUsername: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        username: 'user',
        role: 'USER',
      }),
    };
    const bcryptService = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };
    const codeService = {
      generateCodeWithExpiry: jest
        .fn()
        .mockReturnValue({ code: '123456', expiredAt }),
    };
    const sendVerificationEmailUseCase = {
      execute: jest.fn().mockResolvedValue({ success: true, jobId: 'job-1' }),
    };
    const useCase = new RegisterUserUseCase(
      authRepository as never,
      bcryptService as never,
      codeService as never,
      sendVerificationEmailUseCase as never,
      new AuthErrorMessageUtil(),
    );

    const result = await useCase.execute({
      email: 'user@example.com',
      username: 'user',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.user.id).toBe('user-1');
    expect(authRepository.createUser).toHaveBeenCalledWith({
      email: 'user@example.com',
      username: 'user',
      password: 'hashed-password',
      verification_code: '123456',
      verification_code_expired: expiredAt,
    });
    expect(sendVerificationEmailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      code: '123456',
      ttl: expiredAt,
    });
  });

  it('rejects duplicate email before creating user', async () => {
    const authRepository = {
      findUserByEmail: jest.fn().mockResolvedValue({ id: 'user-1' }),
      findUserByUsername: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-1' }),
      findByUsername: jest.fn().mockResolvedValue(null),
      createUser: jest.fn(),
    };
    const useCase = new RegisterUserUseCase(
      authRepository as never,
      { hashPassword: jest.fn() } as never,
      { generateCodeWithExpiry: jest.fn() } as never,
      { execute: jest.fn() } as never,
      new AuthErrorMessageUtil(),
    );

    await expect(
      useCase.execute({
        email: 'user@example.com',
        username: 'user',
        password: 'password',
        confirmPassword: 'password',
      }),
    ).rejects.toThrow(ConflictError);
    expect(authRepository.createUser).not.toHaveBeenCalled();
  });
});
