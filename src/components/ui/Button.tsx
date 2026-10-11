import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  BUTTON_CLASSES,
  BUTTON_LABEL_CLASSES,
  BUTTON_LOADING_COLORS,
} from '@/components/ui/constants/button.constants';
import { ButtonProps } from '@/components/ui/types/button.types';
import colors from '@/theme/colors.json';

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
      className={`min-h-14 items-center justify-center rounded-full px-5 ${BUTTON_CLASSES[variant]} ${isDisabled ? 'opacity-60' : ''}`}
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
          <ActivityIndicator
            color={BUTTON_LOADING_COLORS[variant]}
            size="small"
          />
        ) : (
          icon
        )}
        <Text
          className={`text-base font-extrabold tracking-wider ${BUTTON_LABEL_CLASSES[variant]}`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
