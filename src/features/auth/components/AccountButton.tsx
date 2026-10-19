import { Pressable } from 'react-native';

import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { AccountButtonProps } from '@/features/auth/types/account.types';
import colors from '@/theme/colors.json';

export function AccountButton({ onPress }: AccountButtonProps) {
  const { status, user } = useAuth();
  const isGoogleUser = status === 'ready' && user?.isGuest === false;
  const accessibilityLabel = isGoogleUser
    ? AUTH_LABELS.account.accessibility.openGoogle
    : AUTH_LABELS.account.accessibility.openGuest;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={`h-11 w-11 items-center justify-center overflow-hidden rounded-full border ${
        isGoogleUser ? 'border-primary bg-primary' : 'border-primary bg-surface'
      }`}
      disabled={status !== 'ready' || !user}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: status !== 'ready' || !user ? 0.5 : pressed ? 0.72 : 1,
      })}
      testID="account-button"
    >
      <AccountAvatar
        avatarUrl={isGoogleUser ? (user?.avatarUrl ?? null) : null}
        fallbackColor={isGoogleUser ? colors.primaryForeground : colors.primary}
        fallbackSize={22}
        imageTestID="account-button-avatar-image"
      />
    </Pressable>
  );
}
