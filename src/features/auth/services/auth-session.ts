import { setApiAccessToken } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AuthSession, AuthUser } from '@/api/contracts/auth';
import {
  bootstrapGuest,
  confirmGoogleAccountSwitch as confirmGoogleAccountSwitchRequest,
  linkGoogleIdentity,
  logoutSession,
  refreshSession,
} from '@/api/endpoints/auth.api';
import {
  getOrCreateGuestCredential,
  getStoredRefreshToken,
  clearStoredRefreshToken,
  replaceGuestCredential,
  storeRefreshToken,
} from './auth-storage';
import {
  GoogleAccountUpgradeResult,
  LogoutResult,
  SessionInitializationResult,
  StoredSessionRefreshResult,
} from '@/features/auth/types/auth.types';

let sessionGeneration = 0;
let logoutInFlight: Promise<LogoutResult> | null = null;
let sessionInitializationInFlight: Promise<SessionInitializationResult> | null =
  null;
let localLogoutTransitionActive = false;

class SessionOperationSupersededError extends Error {}

async function activateSession(
  session: AuthSession,
  expectedGeneration: number,
): Promise<AuthUser> {
  if (expectedGeneration !== sessionGeneration) {
    throw new SessionOperationSupersededError();
  }

  await storeRefreshToken(session.refreshToken);

  if (expectedGeneration !== sessionGeneration) {
    await clearStoredRefreshToken();
    throw new SessionOperationSupersededError();
  }

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
  const generation = sessionGeneration;
  const session = await confirmGoogleAccountSwitchRequest(confirmationToken);
  return activateSession(session, generation);
}

export async function refreshStoredSession(): Promise<StoredSessionRefreshResult | null> {
  if (localLogoutTransitionActive) {
    return null;
  }

  const generation = sessionGeneration;
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const session = await refreshSession(refreshToken);
    const user = await activateSession(session, generation);
    return {
      accessToken: session.accessToken,
      recoveredFromInvalidSession: false,
      user,
    };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      return null;
    }

    setApiAccessToken(null);
    await clearStoredRefreshToken();

    try {
      const session = await bootstrapAvailableGuest(generation);
      return {
        accessToken: session.accessToken,
        recoveredFromInvalidSession: true,
        user: session.user,
      };
    } catch {
      return {
        accessToken: null,
        recoveredFromInvalidSession: true,
        user: null,
      };
    }
  }
}

export function initializeGuestSession(): Promise<SessionInitializationResult> {
  sessionInitializationInFlight ??= performSessionInitialization().finally(
    () => {
      sessionInitializationInFlight = null;
    },
  );

  return sessionInitializationInFlight;
}

async function performSessionInitialization(): Promise<SessionInitializationResult> {
  const generation = sessionGeneration;
  const refreshToken = await getStoredRefreshToken();

  if (refreshToken) {
    try {
      return {
        recoveredFromInvalidSession: false,
        user: await activateSession(
          await refreshSession(refreshToken),
          generation,
        ),
      };
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }

      setApiAccessToken(null);
      await clearStoredRefreshToken();
    }
  }

  return {
    recoveredFromInvalidSession: Boolean(refreshToken),
    user: (await bootstrapAvailableGuest(generation)).user,
  };
}

export function logoutCurrentSession(): Promise<LogoutResult> {
  logoutInFlight ??= performLogout().finally(() => {
    logoutInFlight = null;
  });

  return logoutInFlight;
}

async function performLogout(): Promise<LogoutResult> {
  ++sessionGeneration;
  let remoteRevoked = false;

  try {
    await logoutSession();
    remoteRevoked = true;
  } catch {
    // Local logout must still complete when the API is temporarily unavailable.
  }

  const generation = ++sessionGeneration;
  localLogoutTransitionActive = true;

  try {
    setApiAccessToken(null);
    await clearStoredRefreshToken();
    const guestCredential = await replaceGuestCredential();

    try {
      const session = await bootstrapGuest(guestCredential);
      const user = await activateSession(session, generation);
      return { guestReady: true, remoteRevoked, user };
    } catch {
      setApiAccessToken(null);
      await clearStoredRefreshToken();
      return { guestReady: false, remoteRevoked, user: null };
    }
  } finally {
    localLogoutTransitionActive = false;
  }
}

async function bootstrapAvailableGuest(
  generation = sessionGeneration,
): Promise<AuthSession> {
  const guestCredential = await getOrCreateGuestCredential();

  try {
    const session = await bootstrapGuest(guestCredential);
    await activateSession(session, generation);
    return session;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const replacement = await replaceGuestCredential();
    const session = await bootstrapGuest(replacement);
    await activateSession(session, generation);
    return session;
  }
}
