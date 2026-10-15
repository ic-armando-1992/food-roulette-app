import { setApiAccessToken } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AuthSession } from '@/api/contracts/auth';
import { bootstrapGuest, refreshSession } from '@/api/endpoints/auth.api';
import {
  initializeGuestSession,
  refreshStoredSession,
} from '@/features/auth/services/auth-session';
import {
  getOrCreateGuestCredential,
  getStoredRefreshToken,
  storeRefreshToken,
} from '@/features/auth/services/auth-storage';

jest.mock('@/api/auth', () => ({
  setApiAccessToken: jest.fn(),
}));
jest.mock('@/api/endpoints/auth.api', () => ({
  bootstrapGuest: jest.fn(),
  refreshSession: jest.fn(),
}));
jest.mock('@/features/auth/services/auth-storage', () => ({
  getOrCreateGuestCredential: jest.fn(),
  getStoredRefreshToken: jest.fn(),
  storeRefreshToken: jest.fn(),
}));

const session: AuthSession = {
  accessToken: 'new-access-token',
  accessTokenExpiresAt: '2030-01-01T00:15:00.000Z',
  refreshToken: 'new-refresh-token',
  refreshTokenExpiresAt: '2030-01-31T00:00:00.000Z',
  user: {
    id: '11111111-1111-4111-8111-111111111111',
    isGuest: true,
    createdAt: '2030-01-01T00:00:00.000Z',
  },
};

describe('guest auth session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(getOrCreateGuestCredential)
      .mockResolvedValue('22222222-2222-4222-8222-222222222222');
    jest.mocked(storeRefreshToken).mockResolvedValue();
  });

  it('restores and rotates a stored session before bootstrapping', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('stored-refresh');
    jest.mocked(refreshSession).mockResolvedValue(session);

    await expect(initializeGuestSession()).resolves.toEqual(session.user);

    expect(refreshSession).toHaveBeenCalledWith('stored-refresh');
    expect(bootstrapGuest).not.toHaveBeenCalled();
    expect(storeRefreshToken).toHaveBeenCalledWith(session.refreshToken);
    expect(setApiAccessToken).toHaveBeenCalledWith(session.accessToken);
  });

  it('restores the same guest after a rejected refresh token', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('revoked-refresh');
    jest.mocked(refreshSession).mockRejectedValue(new ApiError('http', 401));
    jest.mocked(bootstrapGuest).mockResolvedValue(session);

    await expect(initializeGuestSession()).resolves.toEqual(session.user);

    expect(bootstrapGuest).toHaveBeenCalledWith(
      '22222222-2222-4222-8222-222222222222',
    );
  });

  it('does not replace the guest identity on a recoverable network failure', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('stored-refresh');
    jest.mocked(refreshSession).mockRejectedValue(new ApiError('network'));

    await expect(initializeGuestSession()).rejects.toMatchObject({
      kind: 'network',
    });

    expect(bootstrapGuest).not.toHaveBeenCalled();
  });

  it('recovers an expired access token through the guest bootstrap credential', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('replayed-refresh');
    jest.mocked(refreshSession).mockRejectedValue(new ApiError('http', 401));
    jest.mocked(bootstrapGuest).mockResolvedValue(session);

    await expect(refreshStoredSession()).resolves.toBe(session.accessToken);

    expect(setApiAccessToken).toHaveBeenNthCalledWith(1, null);
    expect(setApiAccessToken).toHaveBeenLastCalledWith(session.accessToken);
  });
});
