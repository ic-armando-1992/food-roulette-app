import { useMutation, useQueryClient } from '@tanstack/react-query';

import { checkIn } from '@/api/endpoints/visits.api';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import { VISITS_QUERY_KEY } from '@/features/visits/constants/visits.constants';
import { getCheckInLocation } from '@/features/visits/services/check-in-location';
import { CheckInVariables } from '@/features/visits/types/visits.types';

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, spinId }: CheckInVariables) => {
      const location = await getCheckInLocation();
      return checkIn({ visitId, spinId, ...location });
    },
    mutationKey: ['visits', 'check-in'],
    onSuccess: async (result, variables) => {
      if (result.status !== 'verified') {
        return;
      }

      trackProductEvent(TELEMETRY_EVENTS.restaurantCheckedIn, {
        restaurantId: variables.restaurantId,
        visitId: result.visit.id,
        verificationDistanceMeters: result.visit.verificationDistanceMeters,
      });
      await queryClient.invalidateQueries({ queryKey: VISITS_QUERY_KEY });
    },
    retry: false,
  });
}
