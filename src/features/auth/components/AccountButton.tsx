import { Pressable, Text, View } from 'react-native';

import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { AccountButtonProps } from '@/features/auth/types/account.types';
import colors from '@/theme/colors.json';

export function AccountButton({
  disabled = false,
  level,
  onPress,
}: AccountButtonProps) {
  const { status, user } = useAuth();
  const isGoogleUser = status === 'ready' && user?.isGuest === false;
  const isDisabled = disabled || status === 'initializing';
  const accessibilityLabel = isGoogleUser
    ? AUTH_LABELS.account.accessibility.openGoogle
    : AUTH_LABELS.account.accessibility.openGuest;

  return (
    <View className="relative">
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className={`h-11 w-11 items-center justify-center overflow-hidden rounded-full border ${
          isGoogleUser
            ? 'border-primary bg-primary'
            : 'border-primary bg-surface'
        }`}
        disabled={isDisabled}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: isDisabled ? 0.5 : pressed ? 0.72 : 1,
        })}
        testID="account-button"
      >
        <AccountAvatar
          avatarUrl={isGoogleUser ? (user?.avatarUrl ?? null) : null}
          fallbackColor={
            isGoogleUser ? colors.primaryForeground : colors.primary
          }
          fallbackSize={22}
          imageTestID="account-button-avatar-image"
        />
      </Pressable>
      {level ? (
        <View className="absolute -bottom-1 -right-1 min-w-6 items-center rounded-full border-2 border-background bg-rouletteGold px-1">
          <Text className="text-[10px] font-black text-foreground">
            {level}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
