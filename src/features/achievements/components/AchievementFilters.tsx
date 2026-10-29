import { memo } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import { AchievementFiltersProps } from '../types/achievement.types';

function AchievementFiltersComponent({
  activeFilter,
  onChange,
  options,
}: AchievementFiltersProps) {
  return (
    <ScrollView
      className="mt-3"
      contentContainerStyle={{ columnGap: 8 }}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
    >
      {options.map((option) => {
        const selected = activeFilter === option.key;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`rounded-full border px-4 py-2.5 ${
              selected
                ? 'border-primary bg-primary'
                : 'border-border bg-surface'
            }`}
            key={option.key}
            onPress={() => onChange(option.key)}
          >
            <Text
              className={`font-bold ${
                selected ? 'text-primaryForeground' : 'text-foreground'
              }`}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const AchievementFilters = memo(AchievementFiltersComponent);
