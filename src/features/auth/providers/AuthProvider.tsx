import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { configureApiTokenRefresh } from '@/api/auth';
import { AuthUser } from '@/api/contracts/auth';
import { AUTH_ERROR_MESSAGES } from '@/features/auth/constants/auth.constants';
import {
  beginGoogleAccountUpgrade,
  confirmGoogleAccountSwitch,
  initializeGuestSession,
  logoutCurrentSession,
  refreshStoredSession,
} from '@/features/auth/services/auth-session';
import {
  AuthContextValue,
  AuthProviderProps,
  AuthStatus,
} from '@/features/auth/types/auth.types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const operationGeneration = useRef(0);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sessionRecoveryNoticeVisible, setSessionRecoveryNoticeVisible] =
    useState(false);

  const initialize = useCallback(async () => {
    const generation = ++operationGeneration.current;

    try {
      const result = await initializeGuestSession();

      if (generation !== operationGeneration.current) {
        return;
      }

      setUser(result.user);
      setSessionRecoveryNoticeVisible(result.recoveredFromInvalidSession);
      setStatus('ready');
    } catch {
      if (generation === operationGeneration.current) {
        setUser(null);
        setStatus('unavailable');
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    configureApiTokenRefresh(async () => {
      const generation = operationGeneration.current;
      const result = await refreshStoredSession();

      if (!result) {
        return null;
      }

      if (active && generation === operationGeneration.current) {
        if (result.recoveredFromInvalidSession) {
          queryClient.clear();
          setSessionRecoveryNoticeVisible(true);
        }
        setUser(result.user);
        setStatus(result.user ? 'ready' : 'unavailable');
      }

      return result.accessToken;
    });

    return () => {
      active = false;
      configureApiTokenRefresh(async () => null);
    };
  }, [queryClient]);

  useEffect(() => {
    const generation = ++operationGeneration.current;

    void initializeGuestSession()
      .then((result) => {
        if (generation === operationGeneration.current) {
          setUser(result.user);
          setSessionRecoveryNoticeVisible(result.recoveredFromInvalidSession);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (generation === operationGeneration.current) {
          setUser(null);
          setStatus('unavailable');
        }
      });
  }, []);

  const beginGoogleUpgrade = useCallback(async (idToken: string) => {
    const generation = operationGeneration.current;
    const result = await beginGoogleAccountUpgrade(idToken);

    if (
      result.status === 'linked' &&
      generation === operationGeneration.current
    ) {
      setUser(result.user);
      setSessionRecoveryNoticeVisible(false);
    }

    return result;
  }, []);

  const confirmGoogleSwitch = useCallback(
    async (confirmationToken: string) => {
      const generation = operationGeneration.current;
      const switchedUser = await confirmGoogleAccountSwitch(confirmationToken);

      if (generation === operationGeneration.current) {
        queryClient.clear();
        setUser(switchedUser);
        setSessionRecoveryNoticeVisible(false);
      }

      return switchedUser;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    const generation = ++operationGeneration.current;
    queryClient.clear();
    const result = await logoutCurrentSession();

    if (generation === operationGeneration.current) {
      setUser(result.user);
      setSessionRecoveryNoticeVisible(false);
      setStatus(result.guestReady ? 'ready' : 'unavailable');
    }

    return result;
  }, [queryClient]);

  const dismissSessionRecoveryNotice = useCallback(
    () => setSessionRecoveryNoticeVisible(false),
    [],
  );

  const value = useMemo(
    () => ({
      beginGoogleAccountUpgrade: beginGoogleUpgrade,
      confirmGoogleAccountSwitch: confirmGoogleSwitch,
      dismissSessionRecoveryNotice,
      logout,
      retry: initialize,
      sessionRecoveryNoticeVisible,
      status,
      user,
    }),
    [
      beginGoogleUpgrade,
      confirmGoogleSwitch,
      dismissSessionRecoveryNotice,
      initialize,
      logout,
      sessionRecoveryNoticeVisible,
      status,
      user,
    ],
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
