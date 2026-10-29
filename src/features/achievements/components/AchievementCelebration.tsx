import { Sparkles } from 'lucide-react-native';
import { Modal, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import colors from '@/theme/colors.json';
import {
  ACHIEVEMENT_FEATURED_ART_CONTAINER_SIZE,
  ACHIEVEMENT_FEATURED_IMAGE_SIZE,
  ACHIEVEMENT_RARITY_COLORS,
} from '../constants/achievement.constants';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import { AchievementCelebrationProps } from '../types/achievement.types';
import { AchievementArt } from './AchievementArt';

export function AchievementCelebration({
  notification,
  onContinue,
  onViewAchievements,
}: AchievementCelebrationProps) {
  if (!notification) return null;
  const achievement = notification.achievement;
  const color = ACHIEVEMENT_RARITY_COLORS[achievement.rarity];
  const sparkleCount = achievement.rarity === 'LEGENDARY' ? 8 : 4;

  return (
    <Modal animationType="fade" onRequestClose={onContinue} transparent visible>
      <Animated.View
        className="flex-1 items-center justify-center bg-black/45 px-6"
        entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)}
      >
        <Animated.View
          className="w-full max-w-md items-center overflow-hidden rounded-[36px] bg-background px-6 pb-7 pt-8"
          entering={ZoomIn.springify()
            .damping(13)
            .reduceMotion(ReduceMotion.System)}
        >
          <View
            className="absolute inset-x-0 top-0 h-2"
            style={{ backgroundColor: color }}
          />
          <View className="absolute inset-0">
            {Array.from({ length: sparkleCount }).map((_, index) => (
              <Sparkles
                color={index % 2 ? colors.rouletteGold : color}
                key={index}
                size={18 + (index % 3) * 5}
                style={{
                  left: `${10 + ((index * 23) % 78)}%`,
                  opacity: 0.62,
                  position: 'absolute',
                  top: 24 + ((index * 47) % 210),
                }}
              />
            ))}
          </View>
          <Text className="text-center text-sm font-black uppercase tracking-widest text-primary">
            {ACHIEVEMENT_LABELS.celebrationTitle}
          </Text>
          <View className="mt-4">
            <AchievementArt
              achievement={achievement}
              backgroundColor={`${color}20`}
              containerSize={ACHIEVEMENT_FEATURED_ART_CONTAINER_SIZE}
              size={ACHIEVEMENT_FEATURED_IMAGE_SIZE}
            />
          </View>
          <Text className="mt-3 text-center text-3xl font-black text-foreground">
            {achievement.name}
          </Text>
          <Text className="mt-1 font-black uppercase" style={{ color }}>
            {ACHIEVEMENT_LABELS.rarity[achievement.rarity]}
          </Text>
          <View className="mt-4 rounded-full bg-surfaceSecondary px-5 py-2">
            <Text className="font-black text-foreground">
              {ACHIEVEMENT_LABELS.xpReward(achievement.xpReward)}
            </Text>
          </View>
          <View className="mt-6 w-full gap-3">
            <Button label={ACHIEVEMENT_LABELS.continue} onPress={onContinue} />
            <Button
              label={ACHIEVEMENT_LABELS.viewAchievements}
              onPress={onViewAchievements}
              variant="secondary"
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
