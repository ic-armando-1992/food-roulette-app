import { Pressable, Text, View } from 'react-native';

import { GoogleSignInAction } from '@/features/auth/components/GoogleSignInAction';
import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { GoogleLinkPromptProps } from '@/features/auth/types/account.types';

export function GoogleLinkPrompt({ onDismiss }: GoogleLinkPromptProps) {
  return (
    <View
      className="mx-5 mb-6 gap-4 rounded-3xl border border-border bg-surface px-5 py-5"
      testID="google-link-prompt"
    >
      <View className="gap-1">
        <Text className="text-lg font-extrabold text-foreground">
          {AUTH_LABELS.prompt.title}
        </Text>
        <Text className="text-sm leading-5 text-mutedForeground">
          {AUTH_LABELS.prompt.body}
        </Text>
      </View>
      <View className="items-center gap-2">
        <GoogleSignInAction />
        <Pressable
          accessibilityRole="button"
          className="min-h-11 items-center justify-center px-5"
          onPress={onDismiss}
        >
          <Text className="font-bold text-mutedForeground">
            {AUTH_LABELS.prompt.dismiss}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
