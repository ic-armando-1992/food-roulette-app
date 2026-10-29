import { AchievementProgression } from '@/api/contracts/achievements';

export const ACHIEVEMENT_QUERY_KEYS = {
  catalog: ['achievements', 'catalog'] as const,
  me: (userId: string) => ['achievements', 'me', userId] as const,
  summary: (userId: string) => ['achievements', 'summary', userId] as const,
  unseen: (userId: string) => ['achievements', 'unseen', userId] as const,
  progression: (userId: string) => ['progression', userId] as const,
};

export const ACHIEVEMENT_CACHE_KEYS = {
  catalog: 'achievements:catalog:v1',
  catalogEtag: 'achievements:catalog-etag:v1',
  me: (userId: string) => `achievements:me:v1:${userId}`,
  notifications: (userId: string) => `achievements:notifications:v1:${userId}`,
};

export const ACHIEVEMENT_RARITY_COLORS = {
  COMMON: '#52B788',
  RARE: '#3B82F6',
  EPIC: '#9B5DE5',
  LEGENDARY: '#E09F24',
} as const;

export const ACHIEVEMENT_GRID_COLUMNS = 2;
export const ACHIEVEMENT_GRID_HORIZONTAL_PADDING = 20;
export const ACHIEVEMENT_GRID_TOP_PADDING = 12;
export const ACHIEVEMENT_GRID_BOTTOM_PADDING = 32;
export const ACHIEVEMENT_GRID_GAP = 12;
export const ACHIEVEMENT_CARD_HEIGHT = 246;
export const ACHIEVEMENT_CARD_HORIZONTAL_PADDING = 12;
export const ACHIEVEMENT_CARD_TOP_PADDING = 18;
export const ACHIEVEMENT_CARD_BOTTOM_PADDING = 6;
export const ACHIEVEMENT_CARD_ART_CONTAINER_SIZE = 108;
export const ACHIEVEMENT_CARD_IMAGE_SIZE = 94;
export const ACHIEVEMENT_CARD_ART_SLOT_HEIGHT = 108;
export const ACHIEVEMENT_CARD_TITLE_HEIGHT = 42;
export const ACHIEVEMENT_CARD_TITLE_TOP_PADDING = 2;
export const ACHIEVEMENT_CARD_RARITY_HEIGHT = 18;
export const ACHIEVEMENT_CARD_PROGRESS_HEIGHT = 22;
export const ACHIEVEMENT_CARD_STATUS_HEIGHT = 30;
export const ACHIEVEMENT_FEATURED_ART_CONTAINER_SIZE = 190;
export const ACHIEVEMENT_FEATURED_IMAGE_SIZE = 166;
export const ACHIEVEMENT_INITIAL_RENDER_COUNT = 8;
export const ACHIEVEMENT_RENDER_BATCH_SIZE = 8;
export const ACHIEVEMENT_WINDOW_SIZE = 5;
export const ACHIEVEMENT_IMAGE_TRANSITION_MS = 0;
export const ACHIEVEMENT_CATALOG_STALE_TIME_MS = 5 * 60 * 1_000;

export const DEFAULT_ACHIEVEMENT_PROGRESSION: AchievementProgression = {
  level: 1,
  currentLevel: 1,
  currentLevelXp: 0,
  requiredXpForNextLevel: 80,
  nextLevelXp: 80,
  xpRemaining: 80,
  progressPercentage: 0,
  totalXp: 0,
  maxConfiguredLevel: 50,
};
