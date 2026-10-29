import { Trophy } from 'lucide-react-native';
import { memo } from 'react';
import { Text, View } from 'react-native';
import colors from '@/theme/colors.json';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import { AchievementSummaryCardProps } from '../types/achievement.types';

function AchievementSummaryCardComponent({
  progression,
  totalAchievements,
  unlockedAchievements,
}: AchievementSummaryCardProps) {
  const progressPercentage = Math.min(
    100,
    Math.max(0, progression.progressPercentage),
  );
  const requiredXpForNextLevel = progression.requiredXpForNextLevel;
  const atMaximumLevel = requiredXpForNextLevel === null;

  return (
    <View className="rounded-[28px] border border-border bg-surface p-4">
      <View className="flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-rouletteCream">
          <Trophy color={colors.primary} size={24} />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-black text-foreground">
            {ACHIEVEMENT_LABELS.level(progression.currentLevel)}
          </Text>
          <Text className="text-sm font-semibold text-mutedForeground">
            {ACHIEVEMENT_LABELS.totalXp(progression.totalXp)}
          </Text>
        </View>
        <View className="rounded-full bg-successSurface px-3 py-2">
          <Text className="text-xs font-extrabold text-success">
            {ACHIEVEMENT_LABELS.unlockedCountCompact(
              unlockedAchievements,
              totalAchievements,
            )}
          </Text>
        </View>
      </View>

      <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-surfaceSecondary">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${progressPercentage}%` }}
        />
      </View>
      <View className="mt-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold text-foreground">
          {atMaximumLevel
            ? ACHIEVEMENT_LABELS.maximumLevel
            : ACHIEVEMENT_LABELS.xpProgress(
                progression.currentLevelXp,
                requiredXpForNextLevel,
              )}
        </Text>
        {!atMaximumLevel && progression.xpRemaining !== null ? (
          <Text className="text-xs font-semibold text-primary">
            {ACHIEVEMENT_LABELS.xpRemaining(progression.xpRemaining)}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const AchievementSummaryCard = memo(AchievementSummaryCardComponent);
