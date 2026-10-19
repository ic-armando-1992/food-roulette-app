import { Platform } from 'react-native';
import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isErrorWithCode,
  isNoSavedCredentialFoundResponse,
  isSuccessResponse,
  statusCodes,
} from 'react-native-nitro-google-signin';
import { env } from '@/core/config/env';

let configuredClientId: string | null = null;

export class GoogleSignInUnavailableError extends Error {
  constructor() {
    super('google-sign-in-unavailable');
    this.name = 'GoogleSignInUnavailableError';
  }
}

export function configureGoogleSignIn(): boolean {
  if (
    !env.googleWebClientId ||
    (Platform.OS === 'ios' && !env.googleIosClientId)
  ) {
    return false;
  }

  if (configuredClientId !== env.googleWebClientId) {
    GoogleOneTapSignIn.configure({
      webClientId: env.googleWebClientId,
      iosClientId: env.googleIosClientId,
      offlineAccess: false,
      autoSelectOnSignIn: false,
    });
    configuredClientId = env.googleWebClientId;
  }

  return true;
}

export async function requestGoogleIdToken(): Promise<string | null> {
  if (!configureGoogleSignIn()) {
    throw new GoogleSignInUnavailableError();
  }

  try {
    await GoogleOneTapSignIn.checkPlayServices();
    let response = await GoogleOneTapSignIn.signIn();

    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.createAccount();
    }
    if (isNoSavedCredentialFoundResponse(response)) {
      response = await GoogleOneTapSignIn.presentExplicitSignIn();
    }

    if (isCancelledResponse(response)) {
      return null;
    }

    return isSuccessResponse(response) ? response.data.idToken : null;
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === statusCodes.SIGN_IN_CANCELLED
    ) {
      return null;
    }

    throw error;
  }
}
