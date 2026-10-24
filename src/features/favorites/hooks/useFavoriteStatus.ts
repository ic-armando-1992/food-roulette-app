import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { FavoriteStatus } from '@/api/contracts/favorites';
import {
  getFavoriteStatus,
  removeFavorite,
  saveFavorite,
} from '@/api/endpoints/favorites.api';
import { TELEMETRY_EVENTS } from '@/core/telemetry/constants/telemetry.constants';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { FAVORITES_QUERY_KEYS } from '@/features/favorites/constants/favorites.constants';

export function useFavoriteStatus(restaurantId: string) {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    enabled: status === 'ready' && restaurantId.length > 0,
    queryFn: () => getFavoriteStatus(restaurantId),
    queryKey: FAVORITES_QUERY_KEYS.status(restaurantId),
  });
  const mutation = useMutation({
    mutationFn: async () => {
      const wasFavorite = statusQuery.data?.isFavorite ?? false;

      if (wasFavorite) {
        await removeFavorite(restaurantId);
        return false;
      }

      await saveFavorite(restaurantId);
      return true;
    },
    mutationKey: ['favorites', 'toggle', restaurantId],
    onSuccess: async (isFavorite) => {
      queryClient.setQueryData<FavoriteStatus>(
        FAVORITES_QUERY_KEYS.status(restaurantId),
        { isFavorite },
      );

      if (isFavorite) {
        trackProductEvent(TELEMETRY_EVENTS.restaurantFavorited, {
          restaurantId,
        });
      }

      await queryClient.invalidateQueries({
        queryKey: FAVORITES_QUERY_KEYS.list,
      });
    },
  });

  const toggle = () => {
    if (statusQuery.isError) {
      void statusQuery.refetch();
      return;
    }

    mutation.mutate();
  };

  return {
    error: statusQuery.error ?? mutation.error,
    isFavorite: statusQuery.data?.isFavorite ?? false,
    isPending:
      restaurantId.length > 0 &&
      (status === 'initializing' ||
        statusQuery.isPending ||
        mutation.isPending),
    isReady:
      restaurantId.length > 0 &&
      status === 'ready' &&
      !statusQuery.isPending &&
      !mutation.isPending,
    toggle,
  };
}
