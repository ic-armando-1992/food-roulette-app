import { X } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import colors from '@/theme/colors.json';

export function SessionRecoveryNotice() {
  const { dismissSessionRecoveryNotice, sessionRecoveryNoticeVisible, user } =
    useAuth();

  if (!sessionRecoveryNoticeVisible || !user?.isGuest) {
    return null;
  }

  return (
    <View className="mx-5 mb-4 flex-row gap-3 rounded-2xl border border-primary/20 bg-surface px-4 py-3">
      <View className="flex-1">
        <Text className="font-bold text-foreground">
          {AUTH_LABELS.sessionRecovery.title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-mutedForeground">
          {AUTH_LABELS.sessionRecovery.body}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={AUTH_LABELS.sessionRecovery.accessibilityDismiss}
        accessibilityRole="button"
        className="h-11 w-11 items-center justify-center rounded-full"
        onPress={dismissSessionRecoveryNotice}
      >
        <X color={colors.mutedForeground} size={18} />
      </Pressable>
    </View>
  );
}
