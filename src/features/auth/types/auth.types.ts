import { PropsWithChildren } from 'react';
import { AuthUser } from '@/api/contracts/auth';

export type AuthStatus = 'initializing' | 'ready' | 'unavailable';

export interface AuthContextValue {
  retry: () => Promise<void>;
  status: AuthStatus;
  user: AuthUser | null;
}

export type AuthProviderProps = PropsWithChildren;
