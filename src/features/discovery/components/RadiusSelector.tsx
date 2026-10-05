import { ChevronRight, MapPin } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { RADIUS_OPTIONS } from '@/features/discovery/constants/discovery.constants';
import colors from '@/theme/colors.json';

type RadiusSelectorProps = {
  disabled?: boolean;
  radiusMeters: number;
  onChange: (radiusMeters: number) => void;
};

export function RadiusSelector({
  disabled = false,
  radiusMeters,
  onChange,
}: RadiusSelectorProps) {
  return (
    <View className="rounded-3xl bg-surface p-4">
      <View className="mb-4 flex-row items-center gap-2">
        <MapPin color={colors.foreground} size={20} />
        <Text className="flex-1 text-base font-extrabold text-foreground">
          ¿Qué tan lejos?
        </Text>
        <ChevronRight color={colors.mutedForeground} size={20} />
      </View>
      <View className="flex-row gap-2">
        {RADIUS_OPTIONS.map((option) => {
          const isSelected = option.value === radiusMeters;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ disabled, selected: isSelected }}
              className={`flex-1 rounded-full px-2 py-3 ${
                isSelected ? 'bg-primary' : 'bg-surfaceSecondary'
              } ${disabled ? 'opacity-50' : ''}`}
              disabled={disabled}
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={`text-center text-sm font-bold ${
                  isSelected ? 'text-primaryForeground' : 'text-foreground'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
