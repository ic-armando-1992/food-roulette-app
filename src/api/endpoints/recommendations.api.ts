import { apiRequest } from '@/api/client';
import {
  RandomRecommendationRequest,
  RandomRecommendationResponse,
} from '@/api/contracts/recommendations';

export function requestRandomRecommendation(
  request: RandomRecommendationRequest,
): Promise<RandomRecommendationResponse> {
  return apiRequest<RandomRecommendationResponse>(
    '/v1/recommendations/random',
    {
      body: request,
      method: 'POST',
    },
  );
}
