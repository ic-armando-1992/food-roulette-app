import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { configureApiTokenRefresh } from '@/api/auth';
import { AuthUser } from '@/api/contracts/auth';
import { AUTH_ERROR_MESSAGES } from '@/features/auth/constants/auth.constants';
import {
  beginGoogleAccountUpgrade,
  confirmGoogleAccountSwitch,
  initializeGuestSession,
  refreshStoredSession,
} from '@/features/auth/services/auth-session';
import {
  AuthContextValue,
  AuthProviderProps,
  AuthStatus,
} from '@/features/auth/types/auth.types';

configureApiTokenRefresh(refreshStoredSession);

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<AuthUser | null>(null);

  const initialize = useCallback(async () => {
    setStatus('initializing');

    try {
      setUser(await initializeGuestSession());
      setStatus('ready');
    } catch {
      setStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    void initializeGuestSession()
      .then((authenticatedUser) => {
        setUser(authenticatedUser);
        setStatus('ready');
      })
      .catch(() => setStatus('unavailable'));
  }, []);

  const beginGoogleUpgrade = useCallback(async (idToken: string) => {
    const result = await beginGoogleAccountUpgrade(idToken);

    if (result.status === 'linked') {
      setUser(result.user);
    }

    return result;
  }, []);

  const confirmGoogleSwitch = useCallback(async (confirmationToken: string) => {
    const switchedUser = await confirmGoogleAccountSwitch(confirmationToken);
    setUser(switchedUser);
    return switchedUser;
  }, []);

  const value = useMemo(
    () => ({
      beginGoogleAccountUpgrade: beginGoogleUpgrade,
      confirmGoogleAccountSwitch: confirmGoogleSwitch,
      retry: initialize,
      status,
      user,
    }),
    [beginGoogleUpgrade, confirmGoogleSwitch, initialize, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(AUTH_ERROR_MESSAGES.missingProvider);
  }

  return context;
}
