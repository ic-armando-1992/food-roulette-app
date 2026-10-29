import { UserAchievement } from '@/api/contracts/achievements';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import {
  ACHIEVEMENT_GRID_COLUMNS,
  ACHIEVEMENT_GRID_GAP,
  ACHIEVEMENT_GRID_HORIZONTAL_PADDING,
} from '../constants/achievement.constants';
import {
  AchievementFilter,
  AchievementFilterOption,
} from '../types/achievement.types';

const STATUS_FILTERS: AchievementFilterOption[] = [
  { key: 'ALL', label: ACHIEVEMENT_LABELS.filters.all },
  { key: 'UNLOCKED', label: ACHIEVEMENT_LABELS.filters.unlocked },
  { key: 'PENDING', label: ACHIEVEMENT_LABELS.filters.pending },
  { key: 'SECRET', label: ACHIEVEMENT_LABELS.filters.secret },
];

export function calculateAchievementCardWidth(
  listViewportWidth: number,
  pixelRatio: number,
): number {
  if (listViewportWidth <= 0 || pixelRatio <= 0) return 0;

  const viewportPixels = Math.floor(listViewportWidth * pixelRatio);
  const horizontalPaddingPixels =
    Math.round(ACHIEVEMENT_GRID_HORIZONTAL_PADDING * pixelRatio) * 2;
  const totalGapPixels =
    Math.round(ACHIEVEMENT_GRID_GAP * pixelRatio) *
    (ACHIEVEMENT_GRID_COLUMNS - 1);
  const cardsWidthPixels = Math.max(
    0,
    viewportPixels - horizontalPaddingPixels - totalGapPixels,
  );
  const cardWidthPixels = Math.floor(
    cardsWidthPixels / ACHIEVEMENT_GRID_COLUMNS,
  );

  return cardWidthPixels / pixelRatio;
}

export function isLockedSecret(achievement: UserAchievement): boolean {
  return achievement.isSecret && !achievement.unlockedAt;
}

export function filterAchievements(
  achievements: UserAchievement[],
  filter: AchievementFilter,
): UserAchievement[] {
  if (filter === 'ALL') return achievements;
  if (filter === 'UNLOCKED') {
    return achievements.filter((achievement) => achievement.unlockedAt);
  }
  if (filter === 'PENDING') {
    return achievements.filter((achievement) => !achievement.unlockedAt);
  }
  if (filter === 'SECRET') {
    return achievements.filter((achievement) => achievement.isSecret);
  }

  const category = filter.slice('CATEGORY:'.length);
  return achievements.filter(
    (achievement) => achievement.category === category,
  );
}

export function buildAchievementFilterOptions(
  achievements: UserAchievement[],
): AchievementFilterOption[] {
  const categories = [
    ...new Set(achievements.map((achievement) => achievement.category)),
  ].filter((category) => category !== 'SECRET');

  return [
    ...STATUS_FILTERS,
    ...categories.map((category) => ({
      key: `CATEGORY:${category}` as const,
      label:
        ACHIEVEMENT_LABELS.categories[
          category as keyof typeof ACHIEVEMENT_LABELS.categories
        ] ?? category,
    })),
  ];
}
