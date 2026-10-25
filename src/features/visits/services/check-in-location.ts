import * as Location from 'expo-location';

import { CHECK_IN_LOCATION_TIMEOUT_MS } from '@/features/visits/constants/visits.constants';
import {
  CheckInCoordinates,
  CheckInLocationErrorKind,
} from '@/features/visits/types/visits.types';

export class CheckInLocationError extends Error {
  constructor(public readonly kind: CheckInLocationErrorKind) {
    super(kind);
    this.name = 'CheckInLocationError';
  }
}

export async function getCheckInLocation(): Promise<CheckInCoordinates> {
  let permission = await Location.getForegroundPermissionsAsync();

  if (permission.status === Location.PermissionStatus.UNDETERMINED) {
    permission = await Location.requestForegroundPermissionsAsync();
  }

  if (!permission.granted) {
    throw new CheckInLocationError('permission_denied');
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const location = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest }),
      new Promise<never>((_resolve, reject) => {
        timeoutId = setTimeout(
          () => reject(new CheckInLocationError('unavailable')),
          CHECK_IN_LOCATION_TIMEOUT_MS,
        );
      }),
    ]);

    if (location.coords.accuracy === null) {
      throw new CheckInLocationError('unavailable');
    }

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracyMeters: location.coords.accuracy,
    };
  } catch (error) {
    if (error instanceof CheckInLocationError) {
      throw error;
    }

    throw new CheckInLocationError('unavailable');
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
