import { UserRound, X } from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatLongDate } from '@/core/utils/format-date';
import { GoogleSignInAction } from '@/features/auth/components/GoogleSignInAction';
import { AUTH_LABELS } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import { AccountModalProps } from '@/features/auth/types/account.types';
import colors from '@/theme/colors.json';

export function AccountModal({ onClose, visible }: AccountModalProps) {
  const { height } = useWindowDimensions();
  const { status, user } = useAuth();
  const isGuest = status === 'ready' && user?.isGuest !== false;
  const createdDate = user ? formatLongDate(user.createdAt, 'es-MX') : null;

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
                  className={`h-20 w-20 items-center justify-center rounded-full border-2 ${
                    isGuest
                      ? 'border-primary bg-surface'
                      : 'border-primary bg-primary'
                  }`}
                  testID="account-avatar-fallback"
                >
                  <UserRound
                    color={isGuest ? colors.primary : colors.primaryForeground}
                    size={36}
                  />
                </View>
                <Text className="mt-4 text-center text-xl font-extrabold text-foreground">
                  {isGuest
                    ? AUTH_LABELS.account.guestTitle
                    : AUTH_LABELS.account.googleTitle}
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-mutedForeground">
                  {isGuest
                    ? AUTH_LABELS.account.guestBody
                    : AUTH_LABELS.account.googleBody}
                </Text>
                {!isGuest && createdDate ? (
                  <Text className="mt-3 text-center text-xs font-semibold text-mutedForeground">
                    {AUTH_LABELS.account.memberSince(createdDate)}
                  </Text>
                ) : null}
              </View>

              {isGuest ? (
                <View className="mt-7 items-center">
                  <GoogleSignInAction onLinked={onClose} />
                </View>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
