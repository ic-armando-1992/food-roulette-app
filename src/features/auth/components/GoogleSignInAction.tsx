import { useState } from 'react';
import { Alert, Text, useWindowDimensions } from 'react-native';
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

export function GoogleSignInAction({ onLinked }: GoogleSignInActionProps) {
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
      const idToken = await requestGoogleIdToken();

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

  return isConfigured ? (
    <GoogleSignInButton
      accessibilityLabel={AUTH_LABELS.google.continue}
      colorScheme="light"
      disabled={isProcessing}
      loading={isProcessing}
      onPress={startGoogleSignIn}
      signInBehavior="none"
      size={
        width >= GOOGLE_SIGN_IN_WIDE_MINIMUM_SCREEN_WIDTH ? 'wide' : 'standard'
      }
      testID="google-sign-in-button"
    />
  ) : (
    <Text className="text-center text-sm text-mutedForeground">
      {AUTH_ERROR_MESSAGES.googleSignInUnavailable}
    </Text>
  );
}
