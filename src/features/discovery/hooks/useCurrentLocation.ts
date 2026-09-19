import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

const LAST_KNOWN_LOCATION_MAX_AGE_MS = 2 * 60 * 1_000;
const LOCATION_REQUEST_TIMEOUT_MS = 12_000;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentLocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied' }
  | { status: 'error' };

function watchForCurrentLocation(): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let subscription: Location.LocationSubscription | undefined;

    const timeoutId = setTimeout(() => {
      settled = true;
      subscription?.remove();
      reject(new Error('Location request timed out'));
    }, LOCATION_REQUEST_TIMEOUT_MS);

    const resolveOnce = (location: Location.LocationObject) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      subscription?.remove();
      resolve(location);
    };

    const rejectOnce = (error: unknown) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      subscription?.remove();
      reject(error);
    };

    void Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 0,
        timeInterval: 1_000,
      },
      resolveOnce,
      (reason) => rejectOnce(new Error(reason)),
    )
      .then((nextSubscription) => {
        subscription = nextSubscription;

        if (settled) {
          nextSubscription.remove();
        }
      })
      .catch(rejectOnce);
  });
}

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({ status: 'idle' });
  const requestInFlight = useRef(false);

  const requestLocation = useCallback(async () => {
    if (requestInFlight.current) {
      return;
    }

    requestInFlight.current = true;
    setState({ status: 'requesting' });

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (permission.status === Location.PermissionStatus.UNDETERMINED) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        setState({ status: 'denied' });
        return;
      }

      const location =
        (await Location.getLastKnownPositionAsync({
          maxAge: LAST_KNOWN_LOCATION_MAX_AGE_MS,
          requiredAccuracy: 200,
        })) ?? (await watchForCurrentLocation());

      setState({
        status: 'granted',
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('No fue posible obtener la ubicación.', error);
      }

      setState({ status: 'error' });
    } finally {
      requestInFlight.current = false;
    }
  }, []);

  return { requestLocation, state };
}
