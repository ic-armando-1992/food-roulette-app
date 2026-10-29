import { AchievementVisualConfig } from '../types/achievement.types';

/**
 * Card-density adjustments derived from each PNG's alpha>=64 content bounds.
 * Translations are expressed in points for the 94-point card image and scale
 * proportionally in larger presentations. Keep the default for non-outliers.
 */
export const DEFAULT_ACHIEVEMENT_VISUAL_CONFIG: AchievementVisualConfig = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

export const ACHIEVEMENT_VISUAL_OVERRIDES: Readonly<
  Record<string, AchievementVisualConfig>
> = {
  first_reroll: { scale: 1.13, translateX: 0, translateY: -0.5 },
  ten_rerolls: { scale: 1.13, translateX: 0, translateY: -1 },
  first_spin: { scale: 1.12, translateX: 0, translateY: 0.25 },
  first_accepted: { scale: 1.1, translateX: 0, translateY: -0.75 },
  hundred_decisions: { scale: 1.09, translateX: 0, translateY: 0.5 },
  ten_first_tries: { scale: 1.08, translateX: 0, translateY: 0 },
  five_decisions: { scale: 1.07, translateX: 0, translateY: 0.75 },
  first_try: { scale: 1.07, translateX: 0, translateY: 0 },
  twentyfive_decisions: { scale: 1.06, translateX: 0, translateY: -0.25 },
  locked_achievement: { scale: 1.05, translateX: 0.5, translateY: 1.5 },
  master_roulette: { scale: 1.05, translateX: 0, translateY: -0.25 },
  early_bird: { scale: 1.04, translateX: 0, translateY: -1 },
  far_twentyfive_km: { scale: 1.03, translateX: 0.5, translateY: 0.75 },
  repeat_visit_ten: { scale: 1, translateX: 0.25, translateY: 1.5 },
  three_zones: { scale: 0.97, translateX: 0, translateY: 0.25 },
  seven_day_streak: { scale: 0.97, translateX: 0, translateY: 0.75 },
  thirty_trophies: { scale: 0.96, translateX: 0.25, translateY: 0 },
};

export function getAchievementVisualConfig(
  assetKey: string,
): AchievementVisualConfig {
  return (
    ACHIEVEMENT_VISUAL_OVERRIDES[assetKey] ?? DEFAULT_ACHIEVEMENT_VISUAL_CONFIG
  );
}
