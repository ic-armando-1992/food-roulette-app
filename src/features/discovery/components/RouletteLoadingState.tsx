import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';
import {
  DISCOVERY_LOADING_ICONS,
  DISCOVERY_TIMING,
} from '@/features/discovery/constants/discovery.constants';
import { DISCOVERY_LABELS } from '@/features/discovery/constants/discovery.labels';
import { RouletteLoadingStateProps } from '@/features/discovery/types/discovery.types';
import colors from '@/theme/colors.json';

export function RouletteLoadingState({
  onSpinStopped,
  spinPhase,
}: RouletteLoadingStateProps) {
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveMessage(
        (current) => (current + 1) % DISCOVERY_LABELS.loading.messages.length,
      );
    }, DISCOVERY_TIMING.loadingMessageIntervalMs);

    return () => clearInterval(intervalId);
  }, []);

  const message = DISCOVERY_LABELS.loading.messages[activeMessage];
  const MessageIcon = DISCOVERY_LOADING_ICONS[activeMessage];

  return (
    <View
      accessibilityLabel={DISCOVERY_LABELS.accessibility.searchProgress}
      accessibilityRole="progressbar"
      className="flex-1 items-center px-5 pb-10 pt-5"
    >
      <Text className="mt-5 text-center text-4xl font-black leading-tight text-foreground">
        {DISCOVERY_LABELS.loading.title}
      </Text>
      <Text className="mt-2 text-center text-base text-mutedForeground">
        {DISCOVERY_LABELS.loading.subtitle}
      </Text>

      <View className="my-7">
        <RouletteSpinner onStopped={onSpinStopped} phase={spinPhase} />
      </View>

      <View className="min-h-20 w-full max-w-sm items-center justify-center rounded-3xl bg-surface px-5">
        <Animated.View
          className="flex-row items-center gap-3"
          entering={FadeIn.duration(220)}
          key={message}
        >
          <MessageIcon color={colors.primary} size={22} />
          <Text className="text-base font-semibold text-mutedForeground">
            {message}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
