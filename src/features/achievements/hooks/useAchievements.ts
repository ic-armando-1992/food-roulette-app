import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import {
  getAchievementCatalog,
  getMyAchievements,
} from '@/api/endpoints/achievements.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  ACHIEVEMENT_CATALOG_STALE_TIME_MS,
  ACHIEVEMENT_QUERY_KEYS,
} from '../constants/achievement.constants';
import {
  readCachedCatalog,
  readCachedUserAchievements,
  readCatalogEtag,
  writeCachedCatalog,
  writeCachedUserAchievements,
} from '../services/achievement-cache';
import { AchievementRefreshController } from '../types/achievement.types';

export function useAchievementCatalog() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ACHIEVEMENT_QUERY_KEYS.catalog,
    queryFn: async () => {
      const [cached, etag] = await Promise.all([
        readCachedCatalog(),
        readCatalogEtag(),
      ]);
      if (cached) {
        void getAchievementCatalog(etag)
          .then(async (result) => {
            if (!result.catalog) return;
            await writeCachedCatalog(result.catalog, result.etag);
            queryClient.setQueryData(
              ACHIEVEMENT_QUERY_KEYS.catalog,
              result.catalog,
            );
          })
          .catch(() => undefined);
        return cached;
      }
      const result = await getAchievementCatalog(etag);
      if (result.catalog) {
        await writeCachedCatalog(result.catalog, result.etag);
        return result.catalog;
      }
      const fresh = await getAchievementCatalog();
      if (!fresh.catalog) throw new Error('empty-catalog');
      await writeCachedCatalog(fresh.catalog, fresh.etag);
      return fresh.catalog;
    },
    staleTime: ACHIEVEMENT_CATALOG_STALE_TIME_MS,
  });
}

export function useMyAchievements() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const userId = auth.user?.id ?? '';
  return useQuery({
    enabled: auth.status === 'ready' && Boolean(userId),
    queryKey: ACHIEVEMENT_QUERY_KEYS.me(userId),
    queryFn: async () => {
      const cached = await readCachedUserAchievements(userId);
      if (cached) {
        void getMyAchievements()
          .then(async (value) => {
            await writeCachedUserAchievements(userId, value);
            queryClient.setQueryData(ACHIEVEMENT_QUERY_KEYS.me(userId), value);
          })
          .catch(() => undefined);
        return cached;
      }
      const value = await getMyAchievements();
      await writeCachedUserAchievements(userId, value);
      return value;
    },
  });
}

export function useRefreshAchievements(): AchievementRefreshController {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const userId = auth.user?.id ?? '';
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;

    refreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshError(false);
    try {
      const etag = await readCatalogEtag();
      const [catalogResult, userResult] = await Promise.allSettled([
        getAchievementCatalog(etag),
        userId ? getMyAchievements() : Promise.resolve(null),
      ] as const);

      if (catalogResult.status === 'fulfilled' && catalogResult.value.catalog) {
        await writeCachedCatalog(
          catalogResult.value.catalog,
          catalogResult.value.etag,
        );
        queryClient.setQueryData(
          ACHIEVEMENT_QUERY_KEYS.catalog,
          catalogResult.value.catalog,
        );
      }

      if (userResult.status === 'fulfilled' && userResult.value) {
        await writeCachedUserAchievements(userId, userResult.value);
        queryClient.setQueryData(
          ACHIEVEMENT_QUERY_KEYS.me(userId),
          userResult.value,
        );
      }

      const failed = [catalogResult, userResult].filter(
        (result) => result.status === 'rejected',
      );
      if (failed.length > 0) {
        throw new Error('achievement-refresh-failed');
      }
    } catch {
      setRefreshError(true);
      throw new Error('achievement-refresh-failed');
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [queryClient, userId]);

  return { isRefreshing, refresh, refreshError };
}
