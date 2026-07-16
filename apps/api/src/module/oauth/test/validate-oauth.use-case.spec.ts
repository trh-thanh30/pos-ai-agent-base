import { provider_type } from '@prisma/client';
import { ValidateOauthUseCase } from '../use-cases/validate-oauth.use-case';

describe('ValidateOauthUseCase', () => {
  it('creates a verified google user and stores refresh token when email is new', async () => {
    const oauthRepository = {
      findUserByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        username: 'User Example',
        role: 'USER',
        status: 'ACTIVE',
      }),
      updateUserRefreshToken: jest.fn().mockResolvedValue(undefined),
      findFirstOwnedStore: jest.fn().mockResolvedValue(null),
    };
    const tokenService = {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    };
    const useCase = new ValidateOauthUseCase(
      oauthRepository as never,
      tokenService as never,
    );

    const result = await useCase.execute({
      id: 'google-id',
      emails: [{ value: 'user@example.com' }],
      name: { givenName: 'User', familyName: 'Example' },
      displayName: 'Fallback Name',
    } as never);

    expect(oauthRepository.createUser).toHaveBeenCalledWith({
      email: 'user@example.com',
      username: 'User Example',
      provider_id: 'google-id',
      is_verified: true,
      provider: provider_type.GOOGLE,
      lastLoginAt: expect.any(Date),
    });
    expect(oauthRepository.updateUserRefreshToken).toHaveBeenCalledWith(
      'user-1',
      'refresh-token',
    );
    expect(result.hasStore).toBe(false);
  });
});
