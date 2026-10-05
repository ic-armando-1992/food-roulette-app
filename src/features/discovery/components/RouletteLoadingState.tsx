import { ChefHat, Search, Sparkles, Utensils } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { RouletteSpinner } from '@/features/discovery/components/RouletteSpinner';
import { DISCOVERY_TIMING } from '@/features/discovery/constants/discovery.constants';
import colors from '@/theme/colors.json';

const SEARCH_MESSAGES = [
  { icon: Search, label: 'Explorando restaurantes…' },
  { icon: ChefHat, label: 'Consultando al chef…' },
  { icon: Utensils, label: 'Evitando que comas lo mismo…' },
  { icon: Sparkles, label: 'Casi tenemos tu elección…' },
] as const;

export function RouletteLoadingState() {
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveMessage((current) => (current + 1) % SEARCH_MESSAGES.length);
    }, DISCOVERY_TIMING.loadingMessageIntervalMs);

    return () => clearInterval(intervalId);
  }, []);

  const message = SEARCH_MESSAGES[activeMessage];
  const MessageIcon = message.icon;

  return (
    <View
      accessibilityLabel="Buscando un restaurante cercano"
      accessibilityRole="progressbar"
      className="flex-1 items-center px-5 pb-10 pt-5"
    >
      <Text className="mt-5 text-center text-4xl font-black leading-tight text-foreground">
        La ruleta está{`\n`}decidiendo…
      </Text>
      <Text className="mt-2 text-center text-base text-mutedForeground">
        Buscando un buen lugar cerca de ti.
      </Text>

      <View className="my-7">
        <RouletteSpinner />
      </View>

      <View className="min-h-20 w-full max-w-sm items-center justify-center rounded-3xl bg-surface px-5">
        <Animated.View
          className="flex-row items-center gap-3"
          entering={FadeIn.duration(220)}
          key={message.label}
        >
          <MessageIcon color={colors.primary} size={22} />
          <Text className="text-base font-semibold text-mutedForeground">
            {message.label}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}
