import { PropsWithChildren } from 'react';
import { AuthUser } from '@/api/contracts/auth';
import { GoogleAccountUpgradeResult } from '@/features/auth/services/auth-session';

export type AuthStatus = 'initializing' | 'ready' | 'unavailable';

export interface AuthContextValue {
  beginGoogleAccountUpgrade: (
    idToken: string,
  ) => Promise<GoogleAccountUpgradeResult>;
  confirmGoogleAccountSwitch: (confirmationToken: string) => Promise<AuthUser>;
  retry: () => Promise<void>;
  status: AuthStatus;
  user: AuthUser | null;
}

export type AuthProviderProps = PropsWithChildren;
