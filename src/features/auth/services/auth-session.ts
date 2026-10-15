import { setApiAccessToken } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AuthSession, AuthUser } from '@/api/contracts/auth';
import {
  bootstrapGuest,
  confirmGoogleAccountSwitch as confirmGoogleAccountSwitchRequest,
  linkGoogleIdentity,
  refreshSession,
} from '@/api/endpoints/auth.api';
import {
  getOrCreateGuestCredential,
  getStoredRefreshToken,
  replaceGuestCredential,
  storeRefreshToken,
} from './auth-storage';

export type GoogleAccountUpgradeResult =
  | { status: 'linked'; user: AuthUser }
  | { status: 'conflict'; confirmationToken: string };

async function activateSession(session: AuthSession): Promise<AuthUser> {
  await storeRefreshToken(session.refreshToken);
  setApiAccessToken(session.accessToken);
  return session.user;
}

export async function beginGoogleAccountUpgrade(
  idToken: string,
): Promise<GoogleAccountUpgradeResult> {
  try {
    return {
      status: 'linked',
      user: await linkGoogleIdentity(idToken),
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 409 &&
      error.code === 'GOOGLE_IDENTITY_CONFLICT' &&
      error.confirmationToken
    ) {
      return {
        status: 'conflict',
        confirmationToken: error.confirmationToken,
      };
    }

    throw error;
  }
}

export async function confirmGoogleAccountSwitch(
  confirmationToken: string,
): Promise<AuthUser> {
  return activateSession(
    await confirmGoogleAccountSwitchRequest(confirmationToken),
  );
}

export async function refreshStoredSession(): Promise<string | null> {
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const session = await refreshSession(refreshToken);
    await activateSession(session);
    return session.accessToken;
  } catch (error) {
    setApiAccessToken(null);

    if (!(error instanceof ApiError) || error.status !== 401) {
      return null;
    }

    try {
      return (await bootstrapAvailableGuest()).accessToken;
    } catch {
      return null;
    }
  }
}

export async function initializeGuestSession(): Promise<AuthUser> {
  const refreshToken = await getStoredRefreshToken();

  if (refreshToken) {
    try {
      return await activateSession(await refreshSession(refreshToken));
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }
  }

  return (await bootstrapAvailableGuest()).user;
}

async function bootstrapAvailableGuest(): Promise<AuthSession> {
  const guestCredential = await getOrCreateGuestCredential();

  try {
    const session = await bootstrapGuest(guestCredential);
    await activateSession(session);
    return session;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const replacement = await replaceGuestCredential();
    const session = await bootstrapGuest(replacement);
    await activateSession(session);
    return session;
  }
}
