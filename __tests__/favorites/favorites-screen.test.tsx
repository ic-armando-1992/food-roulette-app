import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { PropsWithChildren } from 'react';
import { Linking } from 'react-native';

import { FavoriteListItem } from '@/api/contracts/favorites';
import { getFavorites, removeFavorite } from '@/api/endpoints/favorites.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { FavoritesScreen } from '@/features/favorites/screens/FavoritesScreen';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('@/api/endpoints/favorites.api', () => ({
  getFavorites: jest.fn(),
  removeFavorite: jest.fn(),
}));

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const favorite: FavoriteListItem = {
  id: '66666666-6666-4666-8666-666666666666',
  restaurantId: '55555555-5555-4555-8555-555555555555',
  createdAt: '2026-10-23T00:00:00.000Z',
  restaurant: {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'La Cocina Favorita',
    formattedAddress: '123 Avenida Favorita',
    primaryType: 'restaurant',
    types: ['restaurant'],
    mapsUri: 'https://maps.example.test/favorite',
    photo: null,
  },
  attribution: {
    provider: 'google_places',
    displayText: 'Google Maps',
  },
};

describe('FavoritesScreen', () => {
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
        createdAt: '2026-10-23T00:00:00.000Z',
      },
    });
    jest.mocked(removeFavorite).mockResolvedValue();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a hydrated favorite, opens Maps and removes it', async () => {
    jest
      .mocked(getFavorites)
      .mockResolvedValueOnce({ favorites: [favorite] })
      .mockResolvedValue({ favorites: [] });
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { gcTime: Infinity, retry: false },
        queries: { gcTime: Infinity, retry: false },
      },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const view = render(<FavoritesScreen />, { wrapper });

    expect(await screen.findByText('La Cocina Favorita')).toBeOnTheScreen();
    expect(screen.getByText('123 Avenida Favorita')).toBeOnTheScreen();
    expect(screen.getByText('Datos de Google Maps')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));
    await waitFor(() =>
      expect(Linking.openURL).toHaveBeenCalledWith(
        'https://maps.example.test/favorite',
      ),
    );

    fireEvent.press(
      screen.getByRole('button', {
        name: 'Quitar La Cocina Favorita de favoritos',
      }),
    );
    await waitFor(() =>
      expect(jest.mocked(removeFavorite).mock.calls[0]?.[0]).toBe(
        favorite.restaurantId,
      ),
    );
    expect(
      await screen.findByText('Aún no tienes favoritos'),
    ).toBeOnTheScreen();

    view.unmount();
    queryClient.clear();
  });

  it('returns to the roulette from the header', async () => {
    jest.mocked(getFavorites).mockResolvedValue({ favorites: [] });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const view = render(<FavoritesScreen />, { wrapper });

    await screen.findByText('Aún no tienes favoritos');
    fireEvent.press(screen.getByRole('button', { name: 'Volver a la ruleta' }));
    expect(mockBack).toHaveBeenCalledTimes(1);

    view.unmount();
    queryClient.clear();
  });
});
