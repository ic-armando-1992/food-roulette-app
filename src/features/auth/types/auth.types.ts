import { PropsWithChildren } from 'react';
import { AuthUser } from '@/api/contracts/auth';

export type AuthStatus = 'initializing' | 'ready' | 'unavailable';

export type GoogleAccountUpgradeResult =
  | { status: 'linked'; user: AuthUser }
  | { status: 'conflict'; confirmationToken: string };

export interface SessionInitializationResult {
  recoveredFromInvalidSession: boolean;
  user: AuthUser;
}

export interface StoredSessionRefreshResult {
  accessToken: string | null;
  recoveredFromInvalidSession: boolean;
  user: AuthUser | null;
}

export interface LogoutResult {
  guestReady: boolean;
  remoteRevoked: boolean;
  user: AuthUser | null;
}

export interface AuthContextValue {
  beginGoogleAccountUpgrade: (
    idToken: string,
  ) => Promise<GoogleAccountUpgradeResult>;
  confirmGoogleAccountSwitch: (confirmationToken: string) => Promise<AuthUser>;
  dismissSessionRecoveryNotice: () => void;
  logout: () => Promise<LogoutResult>;
  retry: () => Promise<void>;
  sessionRecoveryNoticeVisible: boolean;
  status: AuthStatus;
  user: AuthUser | null;
}

export type AuthProviderProps = PropsWithChildren;
