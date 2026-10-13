import { render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '@/features/auth/providers/AuthProvider';
import { initializeGuestSession } from '@/features/auth/services/auth-session';

jest.mock('@/features/auth/services/auth-session', () => ({
  initializeGuestSession: jest.fn(),
  refreshStoredSession: jest.fn(),
}));

function AuthState() {
  const auth = useAuth();
  return <Text>{auth.status}</Text>;
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
});
