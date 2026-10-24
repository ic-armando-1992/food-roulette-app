import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getFavorites, removeFavorite } from '@/api/endpoints/favorites.api';
import {
  FAVORITES_QUERY_KEYS,
  FAVORITES_QUERY_STALE_TIME_MS,
} from '@/features/favorites/constants/favorites.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';

export function useFavorites() {
  const { status } = useAuth();

  return useQuery({
    enabled: status === 'ready',
    queryFn: getFavorites,
    queryKey: FAVORITES_QUERY_KEYS.list,
    staleTime: FAVORITES_QUERY_STALE_TIME_MS,
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFavorite,
    mutationKey: ['favorites', 'remove'],
    onSuccess: async (_result, restaurantId) => {
      queryClient.setQueryData(FAVORITES_QUERY_KEYS.status(restaurantId), {
        isFavorite: false,
      });
      await queryClient.invalidateQueries({
        queryKey: FAVORITES_QUERY_KEYS.list,
      });
    },
  });
}
