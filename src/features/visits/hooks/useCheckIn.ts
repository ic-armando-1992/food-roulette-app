import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkIn } from '@/api/endpoints/visits.api';
import { notify } from '@/core/notifications/notify';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import { VISITS_QUERY_KEY } from '@/features/visits/constants/visits.constants';
import { VISITS_LABELS } from '@/features/visits/constants/visits.labels';
import {
  CheckInLocationError,
  getCheckInLocation,
} from '@/features/visits/services/check-in-location';
import {
  CheckInVariables,
  UseCheckInOptions,
} from '@/features/visits/types/visits.types';

export function useCheckIn(options: UseCheckInOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, spinId }: CheckInVariables) => {
      const location = await getCheckInLocation();

      if (options.onLocationResolved) {
        void Promise.resolve(options.onLocationResolved(location)).catch(
          () => undefined,
        );
      }

      return checkIn({
        visitId,
        spinId,
        ...location,
        observedAt: location.observedAt ?? new Date().toISOString(),
      });
    },
    mutationKey: ['visits', 'check-in'],
    onSuccess: async (result, variables) => {
      if (result.status === 'too_far') {
        notify.warning(VISITS_LABELS.notification.tooFarTitle, {
          description: VISITS_LABELS.notification.tooFar(result.distanceMeters),
        });
        return;
      }

      if (result.status === 'accuracy_too_low') {
        notify.warning(
          VISITS_LABELS.notification.accuracyLow(result.accuracyMeters),
        );
        return;
      }

      if (result.status === 'location_too_old') {
        notify.warning(VISITS_LABELS.notification.locationTooOld);
        return;
      }

      notify.success(VISITS_LABELS.notification.verified);
      trackProductEvent(TELEMETRY_EVENTS.restaurantCheckedIn, {
        restaurantId: variables.restaurantId,
        visitId: result.visit.id,
        verificationDistanceMeters: result.visit.verificationDistanceMeters,
      });
      await queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY });
    },
    onError: (error) => {
      notify.error(
        error instanceof CheckInLocationError
          ? error.kind === 'permission_denied'
            ? VISITS_LABELS.error.permissionDenied
            : VISITS_LABELS.error.locationUnavailable
          : VISITS_LABELS.error.request,
      );
    },
    retry: false,
  });
}
