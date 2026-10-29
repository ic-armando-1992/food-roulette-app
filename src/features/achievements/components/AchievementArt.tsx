import { memo } from 'react';
import { View } from 'react-native';
import { AchievementArtProps } from '../types/achievement.types';
import { AchievementImage } from './AchievementImage';

function AchievementArtComponent({
  achievement,
  backgroundColor,
  concealed = false,
  containerSize,
  size,
  transitionDuration = 0,
}: AchievementArtProps) {
  return (
    <View
      className="items-center justify-center overflow-hidden"
      style={{
        backgroundColor,
        borderRadius: containerSize / 2,
        height: containerSize,
        width: containerSize,
      }}
      testID="achievement-art-container"
    >
      <View
        className="items-center justify-center"
        style={{ height: size, width: size }}
      >
        <AchievementImage
          achievement={achievement}
          concealed={concealed}
          size={size}
          transitionDuration={transitionDuration}
        />
      </View>
    </View>
  );
}

export const AchievementArt = memo(AchievementArtComponent);
