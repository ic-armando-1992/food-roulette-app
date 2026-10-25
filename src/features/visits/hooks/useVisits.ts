import { useQuery } from '@tanstack/react-query';

import { getVisits } from '@/api/endpoints/visits.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  VISITS_QUERY_KEY,
  VISITS_STALE_TIME_MS,
} from '@/features/visits/constants/visits.constants';

export function useVisits() {
  const { status } = useAuth();

  return useQuery({
    enabled: status === 'ready',
    queryFn: getVisits,
    queryKey: VISITS_QUERY_KEY,
    staleTime: VISITS_STALE_TIME_MS,
  });
}
