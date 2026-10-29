export const ACHIEVEMENT_RARITIES = [
  'COMMON',
  'RARE',
  'EPIC',
  'LEGENDARY',
] as const;

export type AchievementRarity = (typeof ACHIEVEMENT_RARITIES)[number];

export type AchievementCatalogItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: AchievementRarity;
  isSecret: boolean;
  isEnabled: boolean;
  target: number | null;
  xpReward: number;
  rewardSpins: number;
  assetKey: string;
  assetVersion: string;
  assetUrl: string | null;
  displayOrder: number;
};

export type AchievementCatalog = {
  version: string;
  language: string;
  achievements: AchievementCatalogItem[];
};

export type AchievementProgression = {
  level: number;
  totalXp: number;
  currentLevel: number;
  currentLevelXp: number;
  requiredXpForNextLevel: number | null;
  nextLevelXp: number | null;
  xpRemaining: number | null;
  progressPercentage: number;
  maxConfiguredLevel: number;
};

export type XpOperationResult = {
  xpAwarded: number;
  activityXpAwarded: number;
  achievementXpAwarded: number;
  previousLevel: number;
  currentLevel: number;
  leveledUp: boolean;
  progression: AchievementProgression;
};

export type ProgressionNotification = {
  notificationId: string;
  fromLevel: number;
  toLevel: number;
  xpAwarded: number;
  createdAt: string;
};

export type ProgressionNotifications = {
  notifications: ProgressionNotification[];
};

export type UserAchievement = AchievementCatalogItem & {
  progress: number | null;
  unlockedAt: string | null;
};

export type UserAchievements = {
  progression: AchievementProgression;
  achievements: UserAchievement[];
};

export type AchievementSummary = AchievementProgression & {
  unlockedAchievements: number;
  totalAchievements: number;
  completionPercentage: number;
};

export type AchievementNotification = {
  notificationId: string;
  achievement: UserAchievement;
  createdAt: string;
};

export type AchievementNotifications = {
  notifications: AchievementNotification[];
};
