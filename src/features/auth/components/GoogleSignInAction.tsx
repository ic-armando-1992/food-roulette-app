import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GoogleSignInButton } from 'react-native-nitro-google-signin';

import {
  AUTH_ERROR_MESSAGES,
  AUTH_LABELS,
  GOOGLE_SIGN_IN_WIDE_MINIMUM_SCREEN_WIDTH,
} from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  configureGoogleSignIn,
  GoogleSignInUnavailableError,
  requestGoogleIdToken,
} from '@/features/auth/services/google-sign-in';
import { GoogleSignInActionProps } from '@/features/auth/types/account.types';
import colors from '@/theme/colors.json';

export function GoogleSignInAction({
  onBeforeSignIn,
  onLinked,
}: GoogleSignInActionProps) {
  const { width } = useWindowDimensions();
  const {
    beginGoogleAccountUpgrade,
    confirmGoogleAccountSwitch,
    status,
    user,
  } = useAuth();
  const [isConfigured] = useState(configureGoogleSignIn);
  const [isProcessing, setIsProcessing] = useState(false);

  if (status !== 'ready' || !user?.isGuest) {
    return null;
  }

  const showGenericError = (unavailable = false) => {
    Alert.alert(
      AUTH_LABELS.google.errorTitle,
      unavailable
        ? AUTH_ERROR_MESSAGES.googleSignInUnavailable
        : AUTH_ERROR_MESSAGES.googleSignInFailed,
    );
  };

  const confirmSwitch = async (confirmationToken: string) => {
    setIsProcessing(true);

    try {
      await confirmGoogleAccountSwitch(confirmationToken);
      onLinked?.();
    } catch {
      showGenericError();
    } finally {
      setIsProcessing(false);
    }
  };

  const startGoogleSignIn = async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const idToken = await requestGoogleIdToken(onBeforeSignIn);

      if (!idToken) {
        return;
      }

      const result = await beginGoogleAccountUpgrade(idToken);

      if (result.status === 'linked') {
        Alert.alert(
          AUTH_LABELS.google.successTitle,
          AUTH_LABELS.google.successMessage,
        );
        onLinked?.();
        return;
      }

      Alert.alert(
        AUTH_LABELS.google.conflictTitle,
        AUTH_LABELS.google.conflictMessage,
        [
          {
            style: 'cancel',
            text: AUTH_LABELS.google.cancel,
          },
          {
            onPress: () => void confirmSwitch(result.confirmationToken),
            style: 'destructive',
            text: AUTH_LABELS.google.conflictConfirm,
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      showGenericError(error instanceof GoogleSignInUnavailableError);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isConfigured) {
    return (
      <Text className="text-center text-sm text-mutedForeground">
        {AUTH_ERROR_MESSAGES.googleSignInUnavailable}
      </Text>
    );
  }

  const buttonSize =
    width >= GOOGLE_SIGN_IN_WIDE_MINIMUM_SCREEN_WIDTH ? 'wide' : 'standard';

  return (
    <View className="items-center gap-2">
      <Pressable
        accessibilityLabel={AUTH_LABELS.google.continue}
        accessibilityRole="button"
        accessibilityState={{ busy: isProcessing, disabled: isProcessing }}
        disabled={isProcessing}
        onPress={() => void startGoogleSignIn()}
        style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
        testID="google-sign-in-button"
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <GoogleSignInButton
            colorScheme="light"
            disabled={isProcessing}
            loading={isProcessing}
            signInBehavior="none"
            size={buttonSize}
          />
        </View>
      </Pressable>
      {isProcessing ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color={colors.primary} size="small" />
          <Text className="text-sm font-semibold text-mutedForeground">
            {AUTH_LABELS.google.opening}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
