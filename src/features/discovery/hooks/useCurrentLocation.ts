import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';

import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';
import {
  DISCOVERY_LABELS,
  LOCATION_ERROR_MESSAGES,
} from '@/features/discovery/constants/discovery.labels';
import {
  CurrentLocationState,
  GeographicCoordinates,
  ResolvedLocationContext,
} from '@/features/discovery/types/discovery.types';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';

function watchForCurrentLocation(): Promise<Location.LocationObject> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let subscription: Location.LocationSubscription | undefined;

    const timeoutId = setTimeout(() => {
      settled = true;
      subscription?.remove();
      reject(new Error(LOCATION_ERROR_MESSAGES.requestTimedOut));
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

function resolveLocationContext(
  coordinates: GeographicCoordinates,
): Promise<ResolvedLocationContext> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error(LOCATION_ERROR_MESSAGES.countryLookupTimedOut)),
      DISCOVERY_TIMING.countryLookupTimeoutMs,
    );

    void Location.reverseGeocodeAsync(coordinates)
      .then((addresses) => {
        const address = addresses.find((candidate) => candidate.isoCountryCode);
        const countryCode = address?.isoCountryCode?.trim().toUpperCase();

        if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) {
          throw new Error(LOCATION_ERROR_MESSAGES.countryUnavailable);
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
              : (address?.country ??
                DISCOVERY_LABELS.location.currentFallback(countryCode)),
        });
      })
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

export function useCurrentLocation() {
  const [state, setState] = useState<CurrentLocationState>({ status: 'idle' });
  const requestInFlight = useRef(false);
  const lastTrackedPermission = useRef<boolean | undefined>(undefined);

  const synchronizeLocation = useCallback(
    async (coordinates: GeographicCoordinates) => {
      const locationContext = await resolveLocationContext(coordinates);
      const resolvedCoordinates = {
        ...coordinates,
        countryCode: locationContext.countryCode,
      };

      setState({
        status: 'granted',
        coordinates: resolvedCoordinates,
        label: locationContext.label,
      });

      return resolvedCoordinates;
    },
    [],
  );

  const requestLocation = useCallback(async () => {
    if (requestInFlight.current) {
      return null;
    }

    requestInFlight.current = true;
    setState({ status: 'requesting' });

    try {
      let permission = await Location.getForegroundPermissionsAsync();

      if (permission.status === Location.PermissionStatus.UNDETERMINED) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        if (lastTrackedPermission.current !== false) {
          trackProductEvent(TELEMETRY_EVENTS.locationDenied, {});
          lastTrackedPermission.current = false;
        }
        setState({ status: 'denied' });
        return null;
      }

      if (lastTrackedPermission.current !== true) {
        trackProductEvent(TELEMETRY_EVENTS.locationGranted, {});
        lastTrackedPermission.current = true;
      }

      const location = await watchForCurrentLocation();
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      return await synchronizeLocation(coordinates);
    } catch (error) {
      if (__DEV__) {
        console.warn(LOCATION_ERROR_MESSAGES.warning, error);
      }

      setState({ status: 'error' });
      return null;
    } finally {
      requestInFlight.current = false;
    }
  }, [synchronizeLocation]);

  return { requestLocation, state, synchronizeLocation };
}
