import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';

export type Coordinates = {
  latitude: number;
  longitude: number;
  countryCode: string;
};

export type CurrentLocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; coordinates: Coordinates; label: string }
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
    }, DISCOVERY_TIMING.locationRequestTimeoutMs);

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

type ResolvedLocationContext = {
  countryCode: string;
  label: string;
};

function resolveLocationContext(coordinates: {
  latitude: number;
  longitude: number;
}): Promise<ResolvedLocationContext> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error('Location country lookup timed out')),
      DISCOVERY_TIMING.countryLookupTimeoutMs,
    );

    void Location.reverseGeocodeAsync(coordinates)
      .then((addresses) => {
        const address = addresses.find((candidate) => candidate.isoCountryCode);
        const countryCode = address?.isoCountryCode?.trim().toUpperCase();

        if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
          throw new Error('Location country could not be determined');
        }

        const locality =
          address?.city ?? address?.district ?? address?.subregion;
        const region = address?.region;
        const labelParts = [locality, region].filter(
          (part, index, parts): part is string =>
            Boolean(part) && parts.indexOf(part) === index,
        );

        resolve({
          countryCode,
          label:
            labelParts.length > 0
              ? labelParts.join(', ')
              : (address?.country ?? `Ubicación actual · ${countryCode}`),
        });
      })
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
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
          maxAge: DISCOVERY_TIMING.lastKnownLocationMaxAgeMs,
          requiredAccuracy: 200,
        })) ?? (await watchForCurrentLocation());
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const locationContext = await resolveLocationContext(coordinates);

      setState({
        status: 'granted',
        coordinates: {
          ...coordinates,
          countryCode: locationContext.countryCode,
        },
        label: locationContext.label,
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
