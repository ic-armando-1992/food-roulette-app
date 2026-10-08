import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';
import { useCurrentLocation } from '@/features/discovery/hooks/useCurrentLocation';

jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

const locationMock = jest.mocked(Location);
const locationObject = {
  coords: {
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: 32.5149,
    longitude: -117.0382,
    speed: null,
  },
  mocked: false,
  timestamp: 0,
} satisfies Location.LocationObject;

describe('useCurrentLocation', () => {
  let consoleWarn: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    locationMock.getForegroundPermissionsAsync.mockResolvedValue({
      granted: true,
      status: Location.PermissionStatus.GRANTED,
    } as Location.LocationPermissionResponse);
    locationMock.getLastKnownPositionAsync.mockResolvedValue(locationObject);
    locationMock.reverseGeocodeAsync.mockResolvedValue([
      {
        city: 'Tijuana',
        country: 'México',
        isoCountryCode: 'mx',
        region: 'Baja California',
      } as Location.LocationGeocodedAddress,
    ]);
  });

  afterEach(() => {
    consoleWarn.mockRestore();
    jest.useRealTimers();
  });

  it('resolves granted coordinates, country and display label', async () => {
    locationMock.getForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.UNDETERMINED,
    } as Location.LocationPermissionResponse);
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({
      granted: true,
      status: Location.PermissionStatus.GRANTED,
    } as Location.LocationPermissionResponse);
    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => result.current.requestLocation());

    expect(
      locationMock.requestForegroundPermissionsAsync,
    ).toHaveBeenCalledTimes(1);
    expect(result.current.state).toEqual({
      status: 'granted',
      coordinates: {
        countryCode: 'MX',
        latitude: 32.5149,
        longitude: -117.0382,
      },
      label: 'Tijuana, Baja California',
    });
  });

  it('exposes denied without repeatedly requesting determined permission', async () => {
    locationMock.getForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.DENIED,
    } as Location.LocationPermissionResponse);
    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => result.current.requestLocation());

    expect(result.current.state).toEqual({ status: 'denied' });
    expect(
      locationMock.requestForegroundPermissionsAsync,
    ).not.toHaveBeenCalled();
  });

  it('exposes unavailable location as a recoverable error', async () => {
    locationMock.getLastKnownPositionAsync.mockRejectedValue(
      new Error('location unavailable'),
    );
    const { result } = renderHook(() => useCurrentLocation());

    await act(async () => result.current.requestLocation());

    expect(result.current.state).toEqual({ status: 'error' });
  });

  it('times out a current-location watch that never produces coordinates', async () => {
    jest.useFakeTimers();
    const remove = jest.fn();
    locationMock.getLastKnownPositionAsync.mockResolvedValue(null);
    locationMock.watchPositionAsync.mockResolvedValue({ remove });
    const { result } = renderHook(() => useCurrentLocation());

    let request: Promise<void> | undefined;
    act(() => {
      request = result.current.requestLocation();
    });
    await act(async () => {
      await Promise.resolve();
      await jest.advanceTimersByTimeAsync(
        DISCOVERY_TIMING.locationRequestTimeoutMs,
      );
      await request;
    });

    expect(result.current.state).toEqual({ status: 'error' });
    expect(remove).toHaveBeenCalled();
  });
});
