import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { Linking } from 'react-native';

import { VisitHistoryItem } from '@/api/contracts/visits';
import { getVisits } from '@/api/endpoints/visits.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { VisitsScreen } from '@/features/visits/screens/VisitsScreen';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/api/endpoints/visits.api', () => ({
  checkIn: jest.fn(),
  getVisits: jest.fn(),
}));

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const visit: VisitHistoryItem = {
  id: '88888888-8888-4888-8888-888888888888',
  restaurantId: '55555555-5555-4555-8555-555555555555',
  spinId: '33333333-3333-4333-8333-333333333333',
  checkedInAt: '2026-10-25T12:00:00.000Z',
  verificationDistanceMeters: 42.5,
  source: 'roulette',
  restaurant: {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'La Cocina Visitada',
    formattedAddress: '150 Avenida del Check-In',
    primaryType: 'restaurant',
    types: ['restaurant'],
    mapsUri: 'https://maps.example.test/visit',
    photo: null,
  },
  attribution: {
    provider: 'google_places',
    displayText: 'Google Maps',
  },
};

describe('VisitsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: false,
      status: 'ready',
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        isGuest: true,
        displayName: null,
        avatarUrl: null,
        createdAt: '2026-10-25T00:00:00.000Z',
      },
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('shows a verified visit with live provider details and Maps', async () => {
    jest.mocked(getVisits).mockResolvedValue({ visits: [visit] });
    const { queryClient, wrapper } = createWrapper();
    const view = render(<VisitsScreen />, { wrapper });

    expect(await screen.findByText('La Cocina Visitada')).toBeOnTheScreen();
    expect(screen.getByText('Check-in verificado a 43 m')).toBeOnTheScreen();
    expect(screen.getByText('Datos de Google Maps')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://maps.example.test/visit',
      ),
    );

    view.unmount();
    queryClient.clear();
  });

  it('shows the empty state and returns to the roulette', async () => {
    jest.mocked(getVisits).mockResolvedValue({ visits: [] });
    const { queryClient, wrapper } = createWrapper();
    const view = render(<VisitsScreen />, { wrapper });

    expect(await screen.findByText('Aún no tienes visitas')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Volver a la ruleta' }));
    expect(mockBack).toHaveBeenCalledTimes(1);

    view.unmount();
    queryClient.clear();
  });

  it('shows account recovery instead of loading forever when auth is unavailable', () => {
    const retry = jest.fn();
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry,
      sessionRecoveryNoticeVisible: false,
      status: 'unavailable',
      user: null,
    });
    const { queryClient, wrapper } = createWrapper();
    const view = render(<VisitsScreen />, { wrapper });

    expect(
      screen.getByText(
        'No pudimos preparar tu cuenta. Inténtalo de nuevo para ver tus visitas.',
      ),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText('INTENTAR DE NUEVO'));
    expect(retry).toHaveBeenCalledTimes(1);

    view.unmount();
    queryClient.clear();
  });
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}
