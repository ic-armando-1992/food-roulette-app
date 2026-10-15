import { setApiAccessToken } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AuthSession } from '@/api/contracts/auth';
import {
  bootstrapGuest,
  confirmGoogleAccountSwitch as confirmGoogleAccountSwitchRequest,
  linkGoogleIdentity,
  refreshSession,
} from '@/api/endpoints/auth.api';
import {
  beginGoogleAccountUpgrade,
  confirmGoogleAccountSwitch,
  initializeGuestSession,
  refreshStoredSession,
} from '@/features/auth/services/auth-session';
import {
  getOrCreateGuestCredential,
  getStoredRefreshToken,
  replaceGuestCredential,
  storeRefreshToken,
} from '@/features/auth/services/auth-storage';

jest.mock('@/api/auth', () => ({
  setApiAccessToken: jest.fn(),
}));
jest.mock('@/api/endpoints/auth.api', () => ({
  bootstrapGuest: jest.fn(),
  confirmGoogleAccountSwitch: jest.fn(),
  linkGoogleIdentity: jest.fn(),
  refreshSession: jest.fn(),
}));
jest.mock('@/features/auth/services/auth-storage', () => ({
  getOrCreateGuestCredential: jest.fn(),
  getStoredRefreshToken: jest.fn(),
  replaceGuestCredential: jest.fn(),
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
    jest
      .mocked(replaceGuestCredential)
      .mockResolvedValue('44444444-4444-4444-8444-444444444444');
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
    expect(replaceGuestCredential).not.toHaveBeenCalled();
  });

  it('creates a recoverable guest only when the stored credential was revoked after upgrade', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('expired-refresh');
    jest.mocked(refreshSession).mockRejectedValue(new ApiError('http', 401));
    jest
      .mocked(bootstrapGuest)
      .mockRejectedValueOnce(new ApiError('http', 401))
      .mockResolvedValueOnce(session);

    await expect(initializeGuestSession()).resolves.toEqual(session.user);

    expect(replaceGuestCredential).toHaveBeenCalledTimes(1);
    expect(bootstrapGuest).toHaveBeenNthCalledWith(
      2,
      '44444444-4444-4444-8444-444444444444',
    );
  });

  it('recovers an expired access token through the guest bootstrap credential', async () => {
    jest.mocked(getStoredRefreshToken).mockResolvedValue('replayed-refresh');
    jest.mocked(refreshSession).mockRejectedValue(new ApiError('http', 401));
    jest.mocked(bootstrapGuest).mockResolvedValue(session);

    await expect(refreshStoredSession()).resolves.toBe(session.accessToken);

    expect(setApiAccessToken).toHaveBeenNthCalledWith(1, null);
    expect(setApiAccessToken).toHaveBeenLastCalledWith(session.accessToken);
  });

  it('returns a linked Google user without replacing the current session tokens', async () => {
    const linkedUser = { ...session.user, isGuest: false };
    jest.mocked(linkGoogleIdentity).mockResolvedValue(linkedUser);

    await expect(
      beginGoogleAccountUpgrade('verified-google-id-token'),
    ).resolves.toEqual({ status: 'linked', user: linkedUser });

    expect(linkGoogleIdentity).toHaveBeenCalledWith('verified-google-id-token');
    expect(storeRefreshToken).not.toHaveBeenCalled();
    expect(setApiAccessToken).not.toHaveBeenCalled();
  });

  it('preserves the active guest session when Google requires confirmation', async () => {
    jest
      .mocked(linkGoogleIdentity)
      .mockRejectedValue(
        new ApiError('http', 409, 'GOOGLE_IDENTITY_CONFLICT', 'C'.repeat(43)),
      );

    await expect(
      beginGoogleAccountUpgrade('verified-google-id-token'),
    ).resolves.toEqual({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });

    expect(storeRefreshToken).not.toHaveBeenCalled();
    expect(setApiAccessToken).not.toHaveBeenCalled();
  });

  it('activates the existing Google account only after confirmation succeeds', async () => {
    const switchedSession = {
      ...session,
      accessToken: 'target-access-token',
      refreshToken: 'target-refresh-token',
      user: {
        ...session.user,
        id: '33333333-3333-4333-8333-333333333333',
        isGuest: false,
      },
    };
    jest
      .mocked(confirmGoogleAccountSwitchRequest)
      .mockResolvedValue(switchedSession);

    await expect(confirmGoogleAccountSwitch('C'.repeat(43))).resolves.toEqual(
      switchedSession.user,
    );

    expect(storeRefreshToken).toHaveBeenCalledWith(
      switchedSession.refreshToken,
    );
    expect(setApiAccessToken).toHaveBeenCalledWith(switchedSession.accessToken);
  });
});
