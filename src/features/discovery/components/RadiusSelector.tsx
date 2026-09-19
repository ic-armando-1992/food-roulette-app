import { Pressable, Text, View } from 'react-native';

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1_000 },
  { label: '3 km', value: 3_000 },
  { label: '5 km', value: 5_000 },
  { label: '10 km', value: 10_000 },
] as const;

type RadiusSelectorProps = {
  radiusMeters: number;
  onChange: (radiusMeters: number) => void;
};

export function RadiusSelector({
  radiusMeters,
  onChange,
}: RadiusSelectorProps) {
  return (
    <View>
      <Text className="mb-3 text-sm font-bold uppercase tracking-widest text-mutedForeground">
        Radio de búsqueda
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {RADIUS_OPTIONS.map((option) => {
          const isSelected = option.value === radiusMeters;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className={`min-w-16 rounded-full border px-4 py-3 ${
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-surface'
              }`}
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
