import { useQueryClient } from '@tanstack/react-query';
import { Href, useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { XpOperationResult } from '@/api/contracts/achievements';
import {
  acknowledgeAchievements,
  acknowledgeProgression,
  getUnseenAchievements,
  getUnseenProgression,
} from '@/api/endpoints/achievements.api';
import { notify } from '@/core/notifications/notify';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { AchievementCelebration } from '../components/AchievementCelebration';
import { LevelUpCelebration } from '../components/LevelUpCelebration';
import { ACHIEVEMENT_QUERY_KEYS } from '../constants/achievement.constants';
import {
  readCachedNotifications,
  writeCachedNotifications,
} from '../services/achievement-cache';
import {
  AchievementNotificationsContextValue,
  AchievementNotificationsProviderProps,
  CelebrationQueueItem,
} from '../types/achievement.types';

const AchievementNotificationsContext =
  createContext<AchievementNotificationsContextValue | null>(null);
const NOOP_ACHIEVEMENT_NOTIFICATIONS: AchievementNotificationsContextValue = {
  refresh: async () => undefined,
  handleProgressionUpdate: async () => undefined,
};

export function AchievementNotificationsProvider({
  children,
}: AchievementNotificationsProviderProps) {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [queue, setQueue] = useState<CelebrationQueueItem[]>([]);
  const generation = useRef(0);
  const userId = auth.user?.id ?? null;

  const replaceQueue = useCallback(
    async (next: CelebrationQueueItem[]) => {
      setQueue(next);
      if (userId) await writeCachedNotifications(userId, next);
    },
    [userId],
  );

  const refresh = useCallback(async () => {
    if (!userId || auth.status !== 'ready') return;
    const activeGeneration = generation.current;
    try {
      const [achievements, levels] = await Promise.all([
        getUnseenAchievements(),
        getUnseenProgression(),
      ]);
      if (activeGeneration !== generation.current) return;
      setQueue((current) => {
        const byId = new Map(
          [
            ...current,
            ...achievements.notifications.map(
              (notification): CelebrationQueueItem => ({
                kind: 'achievement',
                notification,
              }),
            ),
            ...levels.notifications.map(
              (notification): CelebrationQueueItem => ({
                kind: 'level',
                notification,
              }),
            ),
          ].map((item) => [
            `${item.kind}:${item.notification.notificationId}`,
            item,
          ]),
        );
        const next = [...byId.values()];
        void writeCachedNotifications(userId, next);
        return next;
      });
    } catch {
      // The persisted queue remains available while offline.
    }
  }, [auth.status, userId]);

  useEffect(() => {
    const activeGeneration = ++generation.current;
    void (async () => {
      const cached =
        userId && auth.status === 'ready'
          ? await readCachedNotifications(userId)
          : null;
      if (activeGeneration !== generation.current) return;
      setQueue(
        (cached ?? []).filter(
          (item) => item?.kind === 'achievement' || item?.kind === 'level',
        ),
      );
      if (userId && auth.status === 'ready') await refresh();
    })();
  }, [auth.status, refresh, userId]);

  const continueQueue = useCallback(async () => {
    const current = queue[0];
    if (!current || !userId) return;
    const next = queue.slice(1);
    await replaceQueue(next);
    const acknowledge =
      current.kind === 'achievement'
        ? acknowledgeAchievements
        : acknowledgeProgression;
    void acknowledge([current.notification.notificationId])
      .then(async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ACHIEVEMENT_QUERY_KEYS.me(userId),
          }),
          queryClient.invalidateQueries({
            queryKey: ACHIEVEMENT_QUERY_KEYS.summary(userId),
          }),
          queryClient.invalidateQueries({
            queryKey: ACHIEVEMENT_QUERY_KEYS.progression(userId),
          }),
        ]);
      })
      .catch(() => undefined);
  }, [queryClient, queue, replaceQueue, userId]);

  const viewAchievements = useCallback(() => {
    void continueQueue();
    router.push('/achievements' as Href);
  }, [continueQueue, router]);

  const handleProgressionUpdate = useCallback(
    async (update: XpOperationResult | null | undefined) => {
      if (!update || !userId) return;
      if (update.activityXpAwarded > 0) {
        notify.success(`+${update.activityXpAwarded} XP`);
      }
      queryClient.setQueryData(
        ACHIEVEMENT_QUERY_KEYS.progression(userId),
        update.progression,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ACHIEVEMENT_QUERY_KEYS.me(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: ACHIEVEMENT_QUERY_KEYS.summary(userId),
        }),
      ]);
      await refresh();
    },
    [queryClient, refresh, userId],
  );

  const value = useMemo(
    () => ({ handleProgressionUpdate, refresh }),
    [handleProgressionUpdate, refresh],
  );

  const current = queue[0] ?? null;

  return (
    <AchievementNotificationsContext.Provider value={value}>
      {children}
      <AchievementCelebration
        notification={
          current?.kind === 'achievement' ? current.notification : null
        }
        onContinue={() => void continueQueue()}
        onViewAchievements={viewAchievements}
      />
      <LevelUpCelebration
        notification={current?.kind === 'level' ? current.notification : null}
        onContinue={() => void continueQueue()}
        onViewAchievements={viewAchievements}
      />
    </AchievementNotificationsContext.Provider>
  );
}

export function useAchievementNotifications(): AchievementNotificationsContextValue {
  const context = useContext(AchievementNotificationsContext);
  return context ?? NOOP_ACHIEVEMENT_NOTIFICATIONS;
}
