import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Pressable, Text } from 'react-native';
import { refreshApiAccessToken } from '@/api/auth';
import { AuthProvider, useAuth } from '@/features/auth/providers/AuthProvider';
import {
  beginGoogleAccountUpgrade,
  confirmGoogleAccountSwitch,
  initializeGuestSession,
  logoutCurrentSession,
  refreshStoredSession,
} from '@/features/auth/services/auth-session';

jest.mock('@/features/auth/services/auth-session', () => ({
  beginGoogleAccountUpgrade: jest.fn(),
  confirmGoogleAccountSwitch: jest.fn(),
  initializeGuestSession: jest.fn(),
  logoutCurrentSession: jest.fn(),
  refreshStoredSession: jest.fn(),
}));

function AuthState() {
  const auth = useAuth();
  return (
    <>
      <Text>{auth.status}</Text>
      <Text>{`${auth.user?.id ?? 'none'}:${String(auth.user?.isGuest)}`}</Text>
      <Text>{`recovery:${String(auth.sessionRecoveryNoticeVisible)}`}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void auth.beginGoogleAccountUpgrade('verified-token')}
      >
        <Text>LINK GOOGLE</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => void auth.confirmGoogleAccountSwitch('C'.repeat(43))}
      >
        <Text>CONFIRM SWITCH</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={() => void auth.logout()}>
        <Text>LOGOUT</Text>
      </Pressable>
    </>
  );
}

function renderAuthProvider() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Text>Ruleta disponible</Text>
        <AuthState />
      </AuthProvider>
    </QueryClientProvider>,
  );

  return { ...view, queryClient };
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(refreshStoredSession).mockResolvedValue(null);
  });

  it('renders the product immediately and becomes ready after guest bootstrap', async () => {
    jest.mocked(initializeGuestSession).mockResolvedValue({
      recoveredFromInvalidSession: false,
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        isGuest: true,
        displayName: null,
        avatarUrl: null,
        createdAt: '2030-01-01T00:00:00.000Z',
      },
    });

    renderAuthProvider();

    expect(screen.getByText('Ruleta disponible')).toBeOnTheScreen();
    expect(screen.getByText('initializing')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText('ready')).toBeOnTheScreen());
  });

  it('keeps the product available when guest bootstrap fails', async () => {
    jest.mocked(initializeGuestSession).mockRejectedValue(new Error('offline'));

    renderAuthProvider();

    expect(screen.getByText('Ruleta disponible')).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.getByText('unavailable')).toBeOnTheScreen(),
    );
  });

  it('keeps the guest in context on conflict and marks the same user linked on success', async () => {
    const guest = {
      id: '11111111-1111-4111-8111-111111111111',
      isGuest: true,
      displayName: null,
      avatarUrl: null,
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    jest.mocked(initializeGuestSession).mockResolvedValue({
      recoveredFromInvalidSession: false,
      user: guest,
    });
    jest.mocked(beginGoogleAccountUpgrade).mockResolvedValueOnce({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });
    renderAuthProvider();
    await waitFor(() =>
      expect(screen.getByText(`${guest.id}:true`)).toBeOnTheScreen(),
    );

    fireEvent.press(screen.getByText('LINK GOOGLE'));
    await waitFor(() => expect(beginGoogleAccountUpgrade).toHaveBeenCalled());
    expect(screen.getByText(`${guest.id}:true`)).toBeOnTheScreen();

    jest.mocked(beginGoogleAccountUpgrade).mockResolvedValueOnce({
      status: 'linked',
      user: { ...guest, isGuest: false },
    });
    fireEvent.press(screen.getByText('LINK GOOGLE'));
    await waitFor(() =>
      expect(screen.getByText(`${guest.id}:false`)).toBeOnTheScreen(),
    );
  });

  it('updates context to the existing Google user only after confirmation succeeds', async () => {
    const guest = {
      id: '11111111-1111-4111-8111-111111111111',
      isGuest: true,
      displayName: null,
      avatarUrl: null,
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    const target = {
      ...guest,
      id: '22222222-2222-4222-8222-222222222222',
      isGuest: false,
    };
    jest.mocked(initializeGuestSession).mockResolvedValue({
      recoveredFromInvalidSession: false,
      user: guest,
    });
    jest.mocked(confirmGoogleAccountSwitch).mockResolvedValue(target);
    const { queryClient } = renderAuthProvider();
    queryClient.setQueryData(['favorites', 'list'], {
      favorites: [{ id: 'private-guest-favorite' }],
    });
    await waitFor(() =>
      expect(screen.getByText(`${guest.id}:true`)).toBeOnTheScreen(),
    );

    fireEvent.press(screen.getByText('CONFIRM SWITCH'));

    await waitFor(() =>
      expect(screen.getByText(`${target.id}:false`)).toBeOnTheScreen(),
    );
    expect(queryClient.getQueryData(['favorites', 'list'])).toBeUndefined();
  });

  it('switches locally to a new guest after logout', async () => {
    const googleUser = {
      id: '22222222-2222-4222-8222-222222222222',
      isGuest: false,
      displayName: 'Armando Pérez',
      avatarUrl: 'https://example.test/armando.png',
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    const newGuest = {
      ...googleUser,
      id: '33333333-3333-4333-8333-333333333333',
      isGuest: true,
    };
    jest.mocked(initializeGuestSession).mockResolvedValue({
      recoveredFromInvalidSession: false,
      user: googleUser,
    });
    jest.mocked(logoutCurrentSession).mockResolvedValue({
      guestReady: true,
      remoteRevoked: true,
      user: newGuest,
    });
    renderAuthProvider();
    await screen.findByText(`${googleUser.id}:false`);

    fireEvent.press(screen.getByText('LOGOUT'));

    await waitFor(() =>
      expect(screen.getByText(`${newGuest.id}:true`)).toBeOnTheScreen(),
    );
  });

  it('updates the visible identity when an invalid session recovers as guest', async () => {
    const googleUser = {
      id: '22222222-2222-4222-8222-222222222222',
      isGuest: false,
      displayName: 'Armando Pérez',
      avatarUrl: 'https://example.test/armando.png',
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    const recoveredGuest = {
      ...googleUser,
      id: '33333333-3333-4333-8333-333333333333',
      isGuest: true,
    };
    jest.mocked(initializeGuestSession).mockResolvedValue({
      recoveredFromInvalidSession: false,
      user: googleUser,
    });
    jest.mocked(refreshStoredSession).mockResolvedValue({
      accessToken: 'guest-access-token',
      recoveredFromInvalidSession: true,
      user: recoveredGuest,
    });
    renderAuthProvider();
    await screen.findByText(`${googleUser.id}:false`);

    await act(async () => {
      await refreshApiAccessToken();
    });

    expect(screen.getByText(`${recoveredGuest.id}:true`)).toBeOnTheScreen();
    expect(screen.getByText('recovery:true')).toBeOnTheScreen();
  });
});
