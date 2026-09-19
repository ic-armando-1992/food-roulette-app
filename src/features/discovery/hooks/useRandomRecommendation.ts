import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import {
  RandomRecommendationRequest,
  RandomRecommendationResponse,
} from '@/api/contracts/recommendations';
import { requestRandomRecommendation } from '@/api/endpoints/recommendations.api';

export function useRandomRecommendation() {
  const mutation = useMutation({
    mutationFn: requestRandomRecommendation,
    mutationKey: ['recommendations', 'random'],
    retry: false,
  });
  const requestInFlight = useRef(false);

  const recommend = useCallback(
    async (
      request: RandomRecommendationRequest,
    ): Promise<RandomRecommendationResponse | null> => {
      if (requestInFlight.current) {
        return null;
      }

      requestInFlight.current = true;

      try {
        return await mutation.mutateAsync(request);
      } finally {
        requestInFlight.current = false;
      }
    },
    [mutation],
  );

  return { ...mutation, recommend };
}
