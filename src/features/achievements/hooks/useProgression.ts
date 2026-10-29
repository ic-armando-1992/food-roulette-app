import { useQuery } from '@tanstack/react-query';
import { getMyProgression } from '@/api/endpoints/achievements.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { ACHIEVEMENT_QUERY_KEYS } from '../constants/achievement.constants';

export function useProgression() {
  const auth = useAuth();
  const userId = auth.user?.id ?? '';
  return useQuery({
    enabled: auth.status === 'ready' && Boolean(userId),
    queryKey: ACHIEVEMENT_QUERY_KEYS.progression(userId),
    queryFn: getMyProgression,
  });
}
