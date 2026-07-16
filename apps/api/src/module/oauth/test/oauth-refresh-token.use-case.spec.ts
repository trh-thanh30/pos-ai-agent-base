import { ValidationError } from 'app/common/response';
import { OauthRefreshTokenUseCase } from '../use-cases/oauth-refresh-token.use-case';

describe('OauthRefreshTokenUseCase', () => {
  it('refreshes oauth tokens for a valid refresh token', async () => {
    const oauthRepository = {
      findUserByIdAndRefreshToken: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        username: 'user',
        role: 'USER',
        status: 'ACTIVE',
        is_verified: true,
      }),
      listOwnedStores: jest.fn().mockResolvedValue([{ id: 'store-1' }]),
      updateUserRefreshToken: jest.fn().mockResolvedValue(undefined),
    };
    const tokenService = {
      verifyRefreshToken: jest.fn().mockReturnValue({ id: 'user-1' }),
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      }),
    };
    const authUserValidator = {
      validateUserCanLogin: jest.fn(),
    };
    const useCase = new OauthRefreshTokenUseCase(
      oauthRepository as never,
      tokenService as never,
      authUserValidator as never,
    );

    const result = await useCase.execute('refresh-token');

    expect(authUserValidator.validateUserCanLogin).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-1' }),
    );
    expect(oauthRepository.updateUserRefreshToken).toHaveBeenCalledWith(
      'user-1',
      'new-refresh-token',
    );
    expect(result.stores).toEqual([{ id: 'store-1' }]);
  });

  it('rejects missing oauth refresh token user', async () => {
    const useCase = new OauthRefreshTokenUseCase(
      {
        findUserByIdAndRefreshToken: jest.fn().mockResolvedValue(null),
      } as never,
      {
        verifyRefreshToken: jest.fn().mockReturnValue({ id: 'user-1' }),
      } as never,
      { validateUserCanLogin: jest.fn() } as never,
    );

    await expect(useCase.execute('refresh-token')).rejects.toThrow(
      ValidationError,
    );
  });
});
