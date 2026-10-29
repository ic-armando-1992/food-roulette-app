import { Image } from 'expo-image';
import { memo, useState } from 'react';
import { AchievementImageProps } from '../types/achievement.types';
import { getAchievementAsset } from '../constants/achievement-assets';
import { ACHIEVEMENT_CARD_IMAGE_SIZE } from '../constants/achievement.constants';
import { ACHIEVEMENT_LABELS } from '../constants/achievement.labels';
import { getAchievementVisualConfig } from '../constants/achievement-visual-config';

function AchievementImageComponent({
  achievement,
  concealed = false,
  size,
  transitionDuration = 0,
}: AchievementImageProps) {
  const [failedRemoteKey, setFailedRemoteKey] = useState<string | null>(null);
  const assetKey = concealed ? 'locked_achievement' : achievement.assetKey;
  const visualConfig = getAchievementVisualConfig(assetKey);
  const sizeRatio = size / ACHIEVEMENT_CARD_IMAGE_SIZE;
  const localSource = getAchievementAsset(assetKey);
  const remoteKey =
    !concealed && achievement.assetUrl
      ? `${achievement.assetUrl}${achievement.assetUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(achievement.assetVersion)}`
      : null;
  const useRemote = remoteKey && failedRemoteKey !== remoteKey;

  return (
    <Image
      accessibilityLabel={
        concealed ? ACHIEVEMENT_LABELS.secret.name : achievement.name
      }
      allowDownscaling
      cachePolicy="memory-disk"
      contentFit="contain"
      onError={useRemote ? () => setFailedRemoteKey(remoteKey) : undefined}
      placeholder={useRemote ? localSource : undefined}
      priority="normal"
      recyclingKey={`${assetKey}:${achievement.assetVersion}`}
      source={useRemote ? { uri: remoteKey } : localSource}
      style={{
        height: size,
        transform: [
          { translateX: visualConfig.translateX * sizeRatio },
          { translateY: visualConfig.translateY * sizeRatio },
          { scale: visualConfig.scale },
        ],
        width: size,
      }}
      transition={transitionDuration}
    />
  );
}

export const AchievementImage = memo(AchievementImageComponent);
