import {
  AchievementProgression,
  AchievementCatalogItem,
  AchievementNotification,
  ProgressionNotification,
  XpOperationResult,
  UserAchievement,
} from '@/api/contracts/achievements';
import { PropsWithChildren } from 'react';

export type AchievementFilter =
  'ALL' | 'UNLOCKED' | 'PENDING' | 'SECRET' | `CATEGORY:${string}`;

export type AchievementFilterOption = {
  key: AchievementFilter;
  label: string;
};

export type AchievementImageProps = {
  achievement: AchievementCatalogItem;
  concealed?: boolean;
  size: number;
  transitionDuration?: number;
};

export type AchievementArtProps = AchievementImageProps & {
  backgroundColor?: string;
  containerSize: number;
};

export type AchievementVisualConfig = Readonly<{
  scale: number;
  translateX: number;
  translateY: number;
}>;

export type AchievementCardProps = {
  achievement: UserAchievement;
  onPress: (achievement: UserAchievement) => void;
};

export type AchievementSummaryCardProps = {
  progression: AchievementProgression;
  totalAchievements: number;
  unlockedAchievements: number;
};

export type AchievementFiltersProps = {
  activeFilter: AchievementFilter;
  onChange: (filter: AchievementFilter) => void;
  options: AchievementFilterOption[];
};

export type AchievementRefreshController = {
  isRefreshing: boolean;
  refreshError: boolean;
  refresh: () => Promise<void>;
};

export type AchievementDetailProps = {
  achievement: UserAchievement | null;
  onClose: () => void;
};

export type AchievementCelebrationProps = {
  notification: AchievementNotification | null;
  onContinue: () => void;
  onViewAchievements: () => void;
};

export type AchievementNotificationsContextValue = {
  refresh: () => Promise<void>;
  handleProgressionUpdate: (
    update: XpOperationResult | null | undefined,
  ) => Promise<void>;
};

export type CelebrationQueueItem =
  | { kind: 'achievement'; notification: AchievementNotification }
  | { kind: 'level'; notification: ProgressionNotification };

export type LevelUpCelebrationProps = {
  notification: ProgressionNotification | null;
  onContinue: () => void;
  onViewAchievements: () => void;
};

export type AchievementNotificationsProviderProps = PropsWithChildren;
