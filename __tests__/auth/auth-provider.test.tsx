import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import { AuthProvider, useAuth } from '@/features/auth/providers/AuthProvider';
import {
  beginGoogleAccountUpgrade,
  confirmGoogleAccountSwitch,
  initializeGuestSession,
} from '@/features/auth/services/auth-session';

jest.mock('@/features/auth/services/auth-session', () => ({
  beginGoogleAccountUpgrade: jest.fn(),
  confirmGoogleAccountSwitch: jest.fn(),
  initializeGuestSession: jest.fn(),
  refreshStoredSession: jest.fn(),
}));

function AuthState() {
  const auth = useAuth();
  return (
    <>
      <Text>{auth.status}</Text>
      <Text>{`${auth.user?.id ?? 'none'}:${String(auth.user?.isGuest)}`}</Text>
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
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the product immediately and becomes ready after guest bootstrap', async () => {
    jest.mocked(initializeGuestSession).mockResolvedValue({
      id: '11111111-1111-4111-8111-111111111111',
      isGuest: true,
      createdAt: '2030-01-01T00:00:00.000Z',
    });

    render(
      <AuthProvider>
        <Text>Ruleta disponible</Text>
        <AuthState />
      </AuthProvider>,
    );

    expect(screen.getByText('Ruleta disponible')).toBeOnTheScreen();
    expect(screen.getByText('initializing')).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText('ready')).toBeOnTheScreen());
  });

  it('keeps the product available when guest bootstrap fails', async () => {
    jest.mocked(initializeGuestSession).mockRejectedValue(new Error('offline'));

    render(
      <AuthProvider>
        <Text>Ruleta disponible</Text>
        <AuthState />
      </AuthProvider>,
    );

    expect(screen.getByText('Ruleta disponible')).toBeOnTheScreen();
    await waitFor(() =>
      expect(screen.getByText('unavailable')).toBeOnTheScreen(),
    );
  });

  it('keeps the guest in context on conflict and marks the same user linked on success', async () => {
    const guest = {
      id: '11111111-1111-4111-8111-111111111111',
      isGuest: true,
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    jest.mocked(initializeGuestSession).mockResolvedValue(guest);
    jest.mocked(beginGoogleAccountUpgrade).mockResolvedValueOnce({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );
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
      createdAt: '2030-01-01T00:00:00.000Z',
    };
    const target = {
      ...guest,
      id: '22222222-2222-4222-8222-222222222222',
      isGuest: false,
    };
    jest.mocked(initializeGuestSession).mockResolvedValue(guest);
    jest.mocked(confirmGoogleAccountSwitch).mockResolvedValue(target);
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );
    await waitFor(() =>
      expect(screen.getByText(`${guest.id}:true`)).toBeOnTheScreen(),
    );

    fireEvent.press(screen.getByText('CONFIRM SWITCH'));

    await waitFor(() =>
      expect(screen.getByText(`${target.id}:false`)).toBeOnTheScreen(),
    );
  });
});
