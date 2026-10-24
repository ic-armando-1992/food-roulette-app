import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import {
  getFavoriteStatus,
  removeFavorite,
  saveFavorite,
} from '@/api/endpoints/favorites.api';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { useFavoriteStatus } from '@/features/favorites/hooks/useFavoriteStatus';

jest.mock('@/api/endpoints/favorites.api', () => ({
  getFavoriteStatus: jest.fn(),
  removeFavorite: jest.fn(),
  saveFavorite: jest.fn(),
}));

jest.mock('@/core/telemetry/telemetry', () => ({
  trackProductEvent: jest.fn(),
}));

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const restaurantId = '55555555-5555-4555-8555-555555555555';

describe('useFavoriteStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useAuth)
      .mockReturnValue({ status: 'ready' } as ReturnType<typeof useAuth>);
    jest.mocked(getFavoriteStatus).mockResolvedValue({ isFavorite: false });
    jest.mocked(saveFavorite).mockResolvedValue({
      id: '66666666-6666-4666-8666-666666666666',
      restaurantId,
      createdAt: '2026-10-23T00:00:00.000Z',
    });
    jest.mocked(removeFavorite).mockResolvedValue();
  });

  it('saves, updates the cache and then removes through the same action', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { gcTime: Infinity, retry: false },
        queries: { gcTime: Infinity, retry: false },
      },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(
      () => useFavoriteStatus(restaurantId),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.isFavorite).toBe(false);

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorite).toBe(true));
    expect(saveFavorite).toHaveBeenCalledWith(restaurantId);
    expect(trackProductEvent).toHaveBeenCalledWith('restaurant_favorited', {
      restaurantId,
    });

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorite).toBe(false));
    expect(removeFavorite).toHaveBeenCalledWith(restaurantId);
    expect(saveFavorite).toHaveBeenCalledTimes(1);
    unmount();
    queryClient.clear();
  });

  it('retries a failed status read before mutating', async () => {
    jest
      .mocked(getFavoriteStatus)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ isFavorite: true });
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { gcTime: Infinity, retry: false },
        queries: { gcTime: Infinity, retry: false },
      },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(
      () => useFavoriteStatus(restaurantId),
      { wrapper },
    );

    await waitFor(() => expect(result.current.error).toBeTruthy());
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    expect(getFavoriteStatus).toHaveBeenCalledTimes(2);
    expect(saveFavorite).not.toHaveBeenCalled();
    expect(removeFavorite).not.toHaveBeenCalled();
    unmount();
    queryClient.clear();
  });
});
