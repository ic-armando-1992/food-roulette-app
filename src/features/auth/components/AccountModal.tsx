import { X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { formatLongDate } from '@/core/utils/format-date';
import { AccountAvatar } from '@/features/auth/components/AccountAvatar';
import { GoogleSignInAction } from '@/features/auth/components/GoogleSignInAction';
import {
  ACCOUNT_MODAL_DISMISS_DELAY_MS,
  AUTH_ERROR_MESSAGES,
  AUTH_LABELS,
} from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { AccountModalProps } from '@/features/auth/types/account.types';
import colors from '@/theme/colors.json';

export function AccountModal({ onClose, visible }: AccountModalProps) {
  const { height } = useWindowDimensions();
  const { logout, retry, status, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isGoogleUser = status === 'ready' && user?.isGuest === false;
  const isGuest = !isGoogleUser;
  const displayName = user?.displayName?.trim();
  const createdDate = user ? formatLongDate(user.createdAt, 'es-MX') : null;

  const performLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const result = await logout();
      onClose();

      if (!result.guestReady) {
        Alert.alert(
          AUTH_LABELS.logout.localOnlyTitle,
          AUTH_LABELS.logout.newGuestUnavailableMessage,
        );
      } else if (!result.remoteRevoked) {
        Alert.alert(
          AUTH_LABELS.logout.localOnlyTitle,
          AUTH_LABELS.logout.localOnlyMessage,
        );
      }
    } catch {
      Alert.alert(
        AUTH_LABELS.logout.errorTitle,
        AUTH_ERROR_MESSAGES.logoutFailed,
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    if (isLoggingOut) {
      return;
    }

    Alert.alert(AUTH_LABELS.logout.title, AUTH_LABELS.logout.message, [
      {
        style: 'cancel',
        text: AUTH_LABELS.logout.cancel,
      },
      {
        onPress: () => void performLogout(),
        style: 'destructive',
        text: AUTH_LABELS.logout.confirm,
      },
    ]);
  };

  const closeBeforeGoogleSignIn = () =>
    new Promise<void>((resolve) => {
      onClose();
      setTimeout(resolve, ACCOUNT_MODAL_DISMISS_DELAY_MS);
    });

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <Pressable
        accessibilityRole="none"
        className="flex-1 justify-end bg-black/40"
        onPress={onClose}
      >
        <Pressable
          accessibilityViewIsModal
          className="rounded-t-3xl bg-background"
          onPress={(event) => event.stopPropagation()}
          style={{ maxHeight: Math.max(240, height - 24) }}
        >
          <SafeAreaView edges={['bottom']}>
            <ScrollView
              contentContainerClassName="px-5 pb-4 pt-5"
              keyboardShouldPersistTaps="handled"
              testID="account-modal-scroll"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-black text-foreground">
                  {AUTH_LABELS.account.title}
                </Text>
                <Pressable
                  accessibilityLabel={AUTH_LABELS.account.accessibility.close}
                  accessibilityRole="button"
                  className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSecondary"
                  onPress={onClose}
                >
                  <X color={colors.foreground} size={22} />
                </Pressable>
              </View>

              <View className="mt-7 items-center">
                <View
                  className={`h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 ${
                    isGuest
                      ? 'border-primary bg-surface'
                      : 'border-primary bg-primary'
                  }`}
                >
                  <AccountAvatar
                    avatarUrl={isGoogleUser ? (user?.avatarUrl ?? null) : null}
                    fallbackColor={
                      isGuest ? colors.primary : colors.primaryForeground
                    }
                    fallbackSize={36}
                    fallbackTestID="account-avatar-fallback"
                    imageTestID="account-avatar-image"
                  />
                </View>
                <Text className="mt-4 text-center text-xl font-extrabold text-foreground">
                  {isGuest
                    ? AUTH_LABELS.account.guestTitle
                    : (displayName ?? AUTH_LABELS.account.googleTitle)}
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-mutedForeground">
                  {isGuest
                    ? AUTH_LABELS.account.guestBody
                    : AUTH_LABELS.account.googleBody}
                </Text>
                {isGoogleUser && createdDate ? (
                  <Text className="mt-3 text-center text-xs font-semibold text-mutedForeground">
                    {AUTH_LABELS.account.memberSince(createdDate)}
                  </Text>
                ) : null}
              </View>

              {status === 'unavailable' ? (
                <View className="mt-7 w-full gap-3 rounded-2xl bg-surfaceSecondary p-4">
                  <Text
                    accessibilityRole="alert"
                    className="text-center text-sm leading-5 text-mutedForeground"
                  >
                    {AUTH_LABELS.account.connectionUnavailable}
                  </Text>
                  <Button
                    label={AUTH_LABELS.account.retry}
                    onPress={() => void retry()}
                    variant="secondary"
                  />
                </View>
              ) : isGuest ? (
                <View className="mt-7 items-center">
                  <GoogleSignInAction
                    onBeforeSignIn={closeBeforeGoogleSignIn}
                    onLinked={onClose}
                  />
                </View>
              ) : null}

              {isGoogleUser ? (
                <Pressable
                  accessibilityLabel={AUTH_LABELS.logout.accessibility}
                  accessibilityRole="button"
                  className="mt-8 min-h-11 items-center justify-center rounded-2xl px-4"
                  disabled={isLoggingOut}
                  onPress={confirmLogout}
                  style={({ pressed }) => ({
                    opacity: isLoggingOut ? 0.45 : pressed ? 0.65 : 1,
                  })}
                >
                  <Text className="text-sm font-bold text-error">
                    {AUTH_LABELS.logout.confirm}
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
