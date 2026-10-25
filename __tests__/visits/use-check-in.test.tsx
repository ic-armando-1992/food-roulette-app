import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { PropsWithChildren } from 'react';

import { checkIn } from '@/api/endpoints/visits.api';
import { useCheckIn } from '@/features/visits/hooks/useCheckIn';
import { getCheckInLocation } from '@/features/visits/services/check-in-location';

jest.mock('@/api/endpoints/visits.api', () => ({ checkIn: jest.fn() }));
jest.mock('@/features/visits/services/check-in-location', () => ({
  getCheckInLocation: jest.fn(),
}));
jest.mock('@/core/telemetry/telemetry', () => ({
  trackProductEvent: jest.fn(),
}));

describe('useCheckIn', () => {
  it('synchronizes the fresh location before submitting the check-in', async () => {
    const location = {
      accuracyMeters: 8,
      latitude: 32.5149,
      longitude: -117.0382,
    };
    const onLocationResolved = jest.fn().mockResolvedValue(undefined);
    jest.mocked(getCheckInLocation).mockResolvedValue(location);
    jest.mocked(checkIn).mockResolvedValue({
      status: 'too_far',
      distanceMeters: 1_250,
      allowedDistanceMeters: 158,
    });
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
      () => useCheckIn({ onLocationResolved }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync({
        visitId: '88888888-8888-4888-8888-888888888888',
        spinId: '33333333-3333-4333-8333-333333333333',
        restaurantId: '55555555-5555-4555-8555-555555555555',
      });
    });

    expect(onLocationResolved).toHaveBeenCalledWith(location);
    expect(checkIn).toHaveBeenCalledWith({
      visitId: '88888888-8888-4888-8888-888888888888',
      spinId: '33333333-3333-4333-8333-333333333333',
      ...location,
    });

    unmount();
    queryClient.clear();
  });
});
