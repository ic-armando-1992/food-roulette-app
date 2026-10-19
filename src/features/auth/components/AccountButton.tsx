import { UserRound } from 'lucide-react-native';
import { Pressable } from 'react-native';

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
      className={`h-11 w-11 items-center justify-center rounded-full border ${
        isGoogleUser ? 'border-primary bg-primary' : 'border-primary bg-surface'
      }`}
      disabled={status !== 'ready' || !user}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: status !== 'ready' || !user ? 0.5 : pressed ? 0.72 : 1,
      })}
      testID="account-button"
    >
      <UserRound
        accessibilityLabel={
          isGoogleUser
            ? AUTH_LABELS.account.accessibility.googleAvatarFallback
            : undefined
        }
        color={isGoogleUser ? colors.primaryForeground : colors.primary}
        size={22}
      />
    </Pressable>
  );
}
