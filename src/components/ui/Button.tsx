import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import colors from '@/theme/colors.json';

type ButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

const buttonClasses = {
  primary: 'bg-primary',
  secondary: 'border border-border bg-surface',
} as const;

const labelClasses = {
  primary: 'text-primaryForeground',
  secondary: 'text-foreground',
} as const;

const loadingColors = {
  primary: colors.primaryForeground,
  secondary: colors.primary,
} as const;

export function Button({
  accessibilityLabel,
  disabled = false,
  icon,
  label,
  loading = false,
  onPress,
  variant = 'primary',
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      className={`min-h-14 items-center justify-center rounded-full px-5 ${buttonClasses[variant]} ${isDisabled ? 'opacity-60' : ''}`}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor:
          pressed && !isDisabled && variant === 'primary'
            ? colors.primaryPressed
            : undefined,
        opacity: pressed && !isDisabled && variant === 'secondary' ? 0.78 : 1,
        transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
      })}
    >
      <View className="flex-row items-center gap-2">
        {loading ? (
          <ActivityIndicator color={loadingColors[variant]} size="small" />
        ) : (
          icon
        )}
        <Text
          className={`text-base font-extrabold tracking-wider ${labelClasses[variant]}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
