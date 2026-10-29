import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { checkIn } from '@/api/endpoints/visits.api';
import { useNotificationStore } from '@/core/notifications/notification.store';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { useCheckIn } from '@/features/visits/hooks/useCheckIn';
import {
  CheckInLocationError,
  getCheckInLocation,
} from '@/features/visits/services/check-in-location';

jest.mock('@/api/endpoints/visits.api', () => ({ checkIn: jest.fn() }));
jest.mock('@/features/visits/services/check-in-location', () => ({
  ...jest.requireActual('@/features/visits/services/check-in-location'),
  getCheckInLocation: jest.fn(),
}));
jest.mock('@/core/telemetry/telemetry', () => ({
  trackProductEvent: jest.fn(),
}));

const location = {
  accuracyMeters: 8,
  latitude: 32.5149,
  longitude: -117.0382,
};
const variables = {
  visitId: '88888888-8888-4888-8888-888888888888',
  spinId: '33333333-3333-4333-8333-333333333333',
  restaurantId: '55555555-5555-4555-8555-555555555555',
};

function renderCheckInHook(onLocationResolved?: jest.Mock) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: Infinity, retry: false },
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useCheckIn({ onLocationResolved }), {
    wrapper,
  });

  return { ...hook, queryClient };
}

describe('useCheckIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCheckInLocation).mockResolvedValue(location);
  });

  it('synchronizes the fresh location before submitting the check-in', async () => {
    const onLocationResolved = jest.fn().mockResolvedValue(undefined);
    jest.mocked(checkIn).mockResolvedValue({
      status: 'too_far',
      distanceMeters: 1_250,
      allowedDistanceMeters: 158,
    });
    const { queryClient, result, unmount } =
      renderCheckInHook(onLocationResolved);

    await act(async () => {
      await result.current.mutateAsync(variables);
    });

    expect(onLocationResolved).toHaveBeenCalledWith(location);
    expect(checkIn).toHaveBeenCalledWith({
      visitId: '88888888-8888-4888-8888-888888888888',
      spinId: '33333333-3333-4333-8333-333333333333',
      ...location,
      observedAt: expect.any(String),
    });
    expect(useNotificationStore.getState().queue[0]).toMatchObject({
      description:
        'Estás a 1.3 km del restaurante. Acércate para registrar tu visita.',
      message: 'Aún no estás ahí 📍',
      type: 'warning',
    });

    unmount();
    queryClient.clear();
  });

  it('reports poor GPS accuracy as a warning', async () => {
    jest.mocked(checkIn).mockResolvedValue({
      status: 'accuracy_too_low',
      accuracyMeters: 212.4,
      maximumAccuracyMeters: 100,
    });
    const { queryClient, result, unmount } = renderCheckInHook();

    await act(async () => {
      await result.current.mutateAsync(variables);
    });

    expect(useNotificationStore.getState().queue[0]).toMatchObject({
      message:
        'La precisión actual es de 212 m. Espera una mejor señal GPS e inténtalo de nuevo.',
      type: 'warning',
    });

    unmount();
    queryClient.clear();
  });

  it('reports a verified visit and refreshes visit history', async () => {
    jest.mocked(checkIn).mockResolvedValue({
      status: 'verified',
      visit: {
        checkedInAt: '2026-10-25T12:00:00.000Z',
        id: variables.visitId,
        locationAccuracyMeters: 8,
        restaurantId: variables.restaurantId,
        source: 'roulette',
        spinId: variables.spinId,
        verificationDistanceMeters: 42.5,
      },
    });
    const { queryClient, result, unmount } = renderCheckInHook();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync(variables);
    });

    expect(useNotificationStore.getState().queue[0]).toMatchObject({
      message: '¡Visita verificada! ✅',
      type: 'success',
    });
    expect(trackProductEvent).toHaveBeenCalledWith('restaurant_checked_in', {
      restaurantId: variables.restaurantId,
      verificationDistanceMeters: 42.5,
      visitId: variables.visitId,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['visits', 'history'],
    });

    unmount();
    queryClient.clear();
  });

  it.each([
    [
      new CheckInLocationError('permission_denied'),
      'Necesitamos permiso de ubicación para verificar que estás en el restaurante.',
    ],
    [
      new CheckInLocationError('unavailable'),
      'No pudimos obtener una ubicación precisa. Intenta de nuevo al aire libre.',
    ],
    [
      new Error('network detail'),
      'No pudimos registrar tu visita. Revisa tu conexión e inténtalo de nuevo.',
    ],
  ])('reports a safe check-in error for %p', async (error, message) => {
    if (error instanceof CheckInLocationError) {
      jest.mocked(getCheckInLocation).mockRejectedValue(error);
    } else {
      jest.mocked(checkIn).mockRejectedValue(error);
    }
    const { queryClient, result, unmount } = renderCheckInHook();

    await act(async () => {
      await expect(result.current.mutateAsync(variables)).rejects.toBe(error);
    });

    expect(useNotificationStore.getState().queue[0]).toMatchObject({
      message,
      type: 'error',
    });

    unmount();
    queryClient.clear();
  });
});
