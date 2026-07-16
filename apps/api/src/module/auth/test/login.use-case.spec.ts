import { ValidationError } from 'app/common/response';
import { LoginUseCase } from '../use-cases/login.use-case';
import { AuthErrorMessageUtil } from '../utils/auth-error-message.util';

describe('LoginUseCase', () => {
  it('validates password, creates token pair and updates refresh token', async () => {
    const authRepository = {
      findUserByEmailOrUsername: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        username: 'user',
        password: 'hashed-password',
        role: 'USER',
        status: 'ACTIVE',
        is_verified: true,
        ownedStores: [{ id: 'store-1', _count: { members: 2 } }],
        memberships: [],
      }),
      updateUserRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
    const bcryptService = {
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    const tokenService = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };
    const authUserValidator = {
      validateUserCanLogin: jest.fn(),
    };
    const useCase = new LoginUseCase(
      authRepository as never,
      bcryptService as never,
      tokenService as never,
      authUserValidator as never,
      new AuthErrorMessageUtil(),
    );

    const result = await useCase.execute({
      usernameOrEmail: 'user@example.com',
      password: 'password',
    });

    expect(authUserValidator.validateUserCanLogin).toHaveBeenCalled();
    expect(authRepository.updateUserRefreshToken).toHaveBeenCalledWith(
      'user-1',
      'refresh-token',
    );
    expect(result.stores).toEqual([
      expect.objectContaining({ id: 'store-1', membersCount: 2 }),
    ]);
  });

  it('rejects invalid password', async () => {
    const useCase = new LoginUseCase(
      {
        findUserByEmailOrUsername: jest.fn().mockResolvedValue({
          password: 'hashed-password',
        }),
      } as never,
      { comparePassword: jest.fn().mockResolvedValue(false) } as never,
      { generateTokenPair: jest.fn() } as never,
      { validateUserCanLogin: jest.fn() } as never,
      new AuthErrorMessageUtil(),
    );

    await expect(
      useCase.execute({
        usernameOrEmail: 'user@example.com',
        password: 'wrong',
      }),
    ).rejects.toThrow(ValidationError);
  });
});
