import { apiRequest } from '@/api/client';
import { AuthSession, AuthUser } from '@/api/contracts/auth';
import { AUTH_API_PATHS } from '@/features/auth/constants/auth.constants';

export function bootstrapGuest(guestCredential: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(AUTH_API_PATHS.guest, {
    auth: 'none',
    body: { guestCredential },
    method: 'POST',
  });
}

export function refreshSession(refreshToken: string): Promise<AuthSession> {
  return apiRequest<AuthSession>(AUTH_API_PATHS.refresh, {
    auth: 'none',
    body: { refreshToken },
    method: 'POST',
  });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiRequest<AuthUser>(AUTH_API_PATHS.me, { auth: 'required' });
}

export function logoutSession(): Promise<void> {
  return apiRequest<void>(AUTH_API_PATHS.logout, {
    auth: 'required',
    method: 'POST',
  });
}

export function linkGoogleIdentity(idToken: string): Promise<AuthUser> {
  return apiRequest<AuthUser>(AUTH_API_PATHS.google, {
    auth: 'required',
    body: { idToken },
    method: 'POST',
  });
}

export function confirmGoogleAccountSwitch(
  confirmationToken: string,
): Promise<AuthSession> {
  return apiRequest<AuthSession>(AUTH_API_PATHS.googleConfirm, {
    auth: 'required',
    body: { confirmationToken },
    method: 'POST',
  });
}
