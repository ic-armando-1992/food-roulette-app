import { ApiError } from '@/api/client';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';

export function getRecommendationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return DISCOVERY_LABELS.error.unexpected;
  }

  if (error.kind === 'configuration') {
    return DISCOVERY_LABELS.error.configuration;
  }

  if (error.kind === 'timeout') {
    return DISCOVERY_LABELS.error.timeout;
  }

  if (error.kind === 'network') {
    return DISCOVERY_LABELS.error.network;
  }

  if (error.status === 404) {
    return DISCOVERY_LABELS.error.noResults;
  }

  if (error.status !== undefined && error.status >= 500) {
    return DISCOVERY_LABELS.error.serviceUnavailable;
  }

  return DISCOVERY_LABELS.error.default;
}
