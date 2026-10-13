import { setApiAccessToken } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AuthSession, AuthUser } from '@/api/contracts/auth';
import { bootstrapGuest, refreshSession } from '@/api/endpoints/auth.api';
import {
  getOrCreateGuestCredential,
  getStoredRefreshToken,
  storeRefreshToken,
} from './auth-storage';

async function activateSession(session: AuthSession): Promise<AuthUser> {
  await storeRefreshToken(session.refreshToken);
  setApiAccessToken(session.accessToken);
  return session.user;
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
      const guestCredential = await getOrCreateGuestCredential();
      const session = await bootstrapGuest(guestCredential);
      await activateSession(session);
      return session.accessToken;
    } catch {
      return null;
    }
  }
}

export async function initializeGuestSession(): Promise<AuthUser> {
  const guestCredential = await getOrCreateGuestCredential();
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

  return activateSession(await bootstrapGuest(guestCredential));
}
