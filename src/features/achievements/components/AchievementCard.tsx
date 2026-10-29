import { Lock, Trophy } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  ACHIEVEMENT_CARD_ART_SLOT_HEIGHT,
  ACHIEVEMENT_CARD_ART_CONTAINER_SIZE,
  ACHIEVEMENT_CARD_BOTTOM_PADDING,
  ACHIEVEMENT_CARD_HEIGHT,
  ACHIEVEMENT_CARD_HORIZONTAL_PADDING,
  ACHIEVEMENT_CARD_IMAGE_SIZE,
  ACHIEVEMENT_CARD_PROGRESS_HEIGHT,
  ACHIEVEMENT_CARD_RARITY_HEIGHT,
  ACHIEVEMENT_CARD_STATUS_HEIGHT,
  ACHIEVEMENT_CARD_TITLE_HEIGHT,
  ACHIEVEMENT_CARD_TITLE_TOP_PADDING,
  ACHIEVEMENT_CARD_TOP_PADDING,
  ACHIEVEMENT_IMAGE_TRANSITION_MS,
  ACHIEVEMENT_RARITY_COLORS,
} from '../constants/achievement.constants';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import { AchievementCardProps } from '../types/achievement.types';
import { isLockedSecret } from '../utils/achievement-ui';
import { AchievementArt } from './AchievementArt';

function AchievementCardComponent({
  achievement,
  onPress,
}: AchievementCardProps) {
  const unlocked = Boolean(achievement.unlockedAt);
  const concealed = isLockedSecret(achievement);
  const target = concealed ? null : achievement.target;
  const progress = achievement.progress ?? 0;
  const percent = target ? Math.min(100, (progress / target) * 100) : 0;
  const color = ACHIEVEMENT_RARITY_COLORS[achievement.rarity];
  const name = concealed ? ACHIEVEMENT_LABELS.secret.name : achievement.name;
  const handlePress = useCallback(
    () => onPress(achievement),
    [achievement, onPress],
  );

  return (
    <Pressable
      accessibilityRole="button"
      className="overflow-hidden rounded-3xl border border-border bg-surface"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed ? 0.82 : achievement.isEnabled ? 1 : 0.58,
        },
      ]}
      testID={`achievement-card-${achievement.id}`}
    >
      <View className="items-center justify-center" style={styles.artSlot}>
        <AchievementArt
          achievement={achievement}
          backgroundColor={`${color}18`}
          concealed={concealed}
          containerSize={ACHIEVEMENT_CARD_ART_CONTAINER_SIZE}
          size={ACHIEVEMENT_CARD_IMAGE_SIZE}
          transitionDuration={ACHIEVEMENT_IMAGE_TRANSITION_MS}
        />
      </View>
      <View
        style={styles.titleSlot}
        testID={`achievement-card-title-${achievement.id}`}
      >
        <Text
          className="text-center text-base font-black text-foreground"
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.15}
          numberOfLines={2}
          style={styles.titleText}
        >
          {name}
        </Text>
      </View>
      <View
        style={styles.raritySlot}
        testID={`achievement-card-rarity-${achievement.id}`}
      >
        <Text
          className="text-center text-xs font-bold uppercase"
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.15}
          numberOfLines={1}
          style={[styles.rarityText, { color }]}
        >
          {ACHIEVEMENT_LABELS.rarity[achievement.rarity]}
        </Text>
      </View>
      <View
        className="justify-center"
        style={styles.progressSlot}
        testID={`achievement-card-progress-${achievement.id}`}
      >
        <View className="h-2 overflow-hidden rounded-full bg-surfaceSecondary">
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: color,
              width: `${unlocked ? 100 : percent}%`,
            }}
          />
        </View>
      </View>
      <View
        className="flex-row items-center justify-center gap-1"
        style={styles.statusSlot}
        testID={`achievement-card-status-${achievement.id}`}
      >
        {unlocked ? (
          <Trophy color={color} size={13} />
        ) : (
          <Lock color={color} size={13} />
        )}
        <Text
          className="shrink text-center text-xs font-semibold text-mutedForeground"
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.15}
          numberOfLines={1}
        >
          {!achievement.isEnabled
            ? ACHIEVEMENT_LABELS.disabled
            : unlocked
              ? ACHIEVEMENT_LABELS.unlocked
              : target === null
                ? ACHIEVEMENT_LABELS.locked
                : ACHIEVEMENT_LABELS.progress(progress, target)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 1,
    height: ACHIEVEMENT_CARD_HEIGHT,
    paddingBottom: ACHIEVEMENT_CARD_BOTTOM_PADDING,
    paddingHorizontal: ACHIEVEMENT_CARD_HORIZONTAL_PADDING,
    paddingTop: ACHIEVEMENT_CARD_TOP_PADDING,
    shadowColor: '#241B18',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    width: '100%',
  },
  artSlot: {
    height: ACHIEVEMENT_CARD_ART_SLOT_HEIGHT,
    marginTop: ACHIEVEMENT_CARD_TOP_PADDING,
  },
  progressSlot: {
    height: ACHIEVEMENT_CARD_PROGRESS_HEIGHT,
    overflow: 'hidden',
  },
  raritySlot: {
    height: ACHIEVEMENT_CARD_RARITY_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rarityText: {
    lineHeight: 16,
  },
  statusSlot: {
    height: ACHIEVEMENT_CARD_STATUS_HEIGHT,
    overflow: 'hidden',
  },
  titleSlot: {
    height: ACHIEVEMENT_CARD_TITLE_HEIGHT,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingTop: ACHIEVEMENT_CARD_TITLE_TOP_PADDING,
  },
  titleText: {
    lineHeight: 20,
  },
});

export const AchievementCard = memo(AchievementCardComponent);
