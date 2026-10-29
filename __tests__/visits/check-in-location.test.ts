import * as Location from 'expo-location';

import {
  CheckInLocationError,
  getCheckInLocation,
} from '@/features/visits/services/check-in-location';

jest.mock('expo-location', () => ({
  Accuracy: { Highest: 6 },
  PermissionStatus: {
    DENIED: 'denied',
    GRANTED: 'granted',
    UNDETERMINED: 'undetermined',
  },
  getCurrentPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

const locationMock = jest.mocked(Location);

describe('getCheckInLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    locationMock.getForegroundPermissionsAsync.mockResolvedValue({
      granted: true,
      status: Location.PermissionStatus.GRANTED,
    } as Location.LocationPermissionResponse);
    locationMock.getCurrentPositionAsync.mockResolvedValue({
      coords: {
        accuracy: 8.5,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 32.5149,
        longitude: -117.0382,
        speed: null,
      },
      mocked: false,
      timestamp: 0,
    });
  });

  it('returns one fresh high-accuracy location sample', async () => {
    await expect(getCheckInLocation()).resolves.toEqual({
      latitude: 32.5149,
      longitude: -117.0382,
      accuracyMeters: 8.5,
      observedAt: '1970-01-01T00:00:00.000Z',
    });
    expect(locationMock.getCurrentPositionAsync).toHaveBeenCalledWith({
      accuracy: Location.Accuracy.Highest,
    });
  });

  it('requests an undetermined permission and rejects denial', async () => {
    locationMock.getForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.UNDETERMINED,
    } as Location.LocationPermissionResponse);
    locationMock.requestForegroundPermissionsAsync.mockResolvedValue({
      granted: false,
      status: Location.PermissionStatus.DENIED,
    } as Location.LocationPermissionResponse);

    await expect(getCheckInLocation()).rejects.toEqual(
      new CheckInLocationError('permission_denied'),
    );
    expect(locationMock.getCurrentPositionAsync).not.toHaveBeenCalled();
  });
});
