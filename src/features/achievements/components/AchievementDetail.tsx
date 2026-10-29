import { X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { formatLongDate } from '@/core/utils/format-date';
import colors from '@/theme/colors.json';
import {
  ACHIEVEMENT_FEATURED_ART_CONTAINER_SIZE,
  ACHIEVEMENT_FEATURED_IMAGE_SIZE,
  ACHIEVEMENT_RARITY_COLORS,
} from '../constants/achievement.constants';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import { AchievementDetailProps } from '../types/achievement.types';
import { isLockedSecret } from '../utils/achievement-ui';
import { AchievementArt } from './AchievementArt';

export function AchievementDetail({
  achievement,
  onClose,
}: AchievementDetailProps) {
  if (!achievement) return null;
  const color = ACHIEVEMENT_RARITY_COLORS[achievement.rarity];
  const unlocked = Boolean(achievement.unlockedAt);
  const concealed = isLockedSecret(achievement);
  const name = concealed ? ACHIEVEMENT_LABELS.secret.name : achievement.name;
  const description = concealed
    ? ACHIEVEMENT_LABELS.secret.description
    : achievement.description;
  const target = concealed ? null : achievement.target;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="rounded-t-[36px] bg-background px-6 pt-5"
          style={{ maxHeight: '92%' }}
        >
          <Pressable
            accessibilityLabel={ACHIEVEMENT_LABELS.accessibility.closeDetail}
            accessibilityRole="button"
            className="self-end rounded-full bg-surfaceSecondary p-3"
            onPress={onClose}
          >
            <X color={colors.foreground} size={22} />
          </Pressable>
          <ScrollView
            contentContainerClassName="items-center pb-10"
            showsVerticalScrollIndicator={false}
          >
            <AchievementArt
              achievement={achievement}
              concealed={concealed}
              containerSize={ACHIEVEMENT_FEATURED_ART_CONTAINER_SIZE}
              size={ACHIEVEMENT_FEATURED_IMAGE_SIZE}
              transitionDuration={160}
            />
            <Text className="mt-3 text-center text-3xl font-black text-foreground">
              {name}
            </Text>
            <Text className="mt-1 font-extrabold uppercase" style={{ color }}>
              {ACHIEVEMENT_LABELS.rarity[achievement.rarity]}
            </Text>
            <Text className="mt-4 text-center text-base leading-6 text-mutedForeground">
              {description}
            </Text>
            <View className="mt-5 w-full flex-row justify-between rounded-3xl bg-surface p-4">
              <Text className="font-bold text-foreground">
                {ACHIEVEMENT_LABELS.xpReward(achievement.xpReward)}
              </Text>
              <Text className="font-semibold text-mutedForeground">
                {target === null
                  ? ACHIEVEMENT_LABELS.secretRequirement
                  : ACHIEVEMENT_LABELS.progress(
                      achievement.progress ?? 0,
                      target,
                    )}
              </Text>
            </View>
            {unlocked && achievement.unlockedAt ? (
              <Text className="mt-4 font-semibold text-success">
                {ACHIEVEMENT_LABELS.unlockedOn(
                  formatLongDate(achievement.unlockedAt, 'es-MX') ?? '',
                )}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
