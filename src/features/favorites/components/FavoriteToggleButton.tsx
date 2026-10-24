import { Heart } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { FAVORITES_LABELS } from '@/features/favorites/constants/favorites.labels';
import { FavoriteToggleButtonProps } from '@/features/favorites/types/favorites.types';
import colors from '@/theme/colors.json';

export function FavoriteToggleButton({
  disabled = false,
  isFavorite,
  isPending,
  onPress,
  restaurantName,
}: FavoriteToggleButtonProps) {
  const isDisabled = disabled || isPending;

  return (
    <Pressable
      accessibilityLabel={
        isFavorite
          ? FAVORITES_LABELS.accessibility.favoriteSelected(restaurantName)
          : FAVORITES_LABELS.accessibility.favorite(restaurantName)
      }
      accessibilityRole="button"
      accessibilityState={{
        busy: isPending,
        checked: isFavorite,
        disabled: isDisabled,
      }}
      className="h-12 w-12 items-center justify-center rounded-full bg-surface"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.55 : pressed ? 0.78 : 0.96,
      })}
    >
      <Heart
        color={isFavorite ? colors.primary : colors.foreground}
        fill={isFavorite ? colors.primary : 'transparent'}
        size={24}
      />
    </Pressable>
  );
}
