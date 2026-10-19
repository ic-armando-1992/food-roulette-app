import { Platform } from 'react-native';
import {
  GoogleOneTapSignIn,
  statusCodes,
} from 'react-native-nitro-google-signin';
import { env } from '@/core/config/env';
import {
  configureGoogleSignIn,
  GoogleSignInUnavailableError,
  requestGoogleIdToken,
} from '@/features/auth/services/google-sign-in';

const successResponse = {
  type: 'success' as const,
  data: {
    idToken: 'verified-google-id-token',
    scopes: [],
    serverAuthCode: null,
    user: {
      id: 'google-subject',
      email: null,
      familyName: null,
      givenName: null,
      name: null,
      photo: null,
    },
  },
};

describe('native Google sign-in', () => {
  const originalWebClientId = env.googleWebClientId;
  const originalIosClientId = env.googleIosClientId;

  beforeEach(() => {
    jest.clearAllMocks();
    env.googleWebClientId = `web-${Math.random()}.apps.googleusercontent.com`;
    env.googleIosClientId = 'ios-client.apps.googleusercontent.com';
    jest.mocked(GoogleOneTapSignIn.checkPlayServices).mockResolvedValue();
  });

  afterAll(() => {
    env.googleWebClientId = originalWebClientId;
    env.googleIosClientId = originalIosClientId;
  });

  it('configures the provider without offline access or automatic account selection', () => {
    expect(configureGoogleSignIn()).toBe(true);

    expect(GoogleOneTapSignIn.configure).toHaveBeenCalledWith({
      webClientId: env.googleWebClientId,
      iosClientId: env.googleIosClientId,
      offlineAccess: false,
      autoSelectOnSignIn: false,
    });
  });

  it('opens the explicit button flow and returns only the ID token', async () => {
    const onBeforePrompt = jest.fn();
    jest
      .mocked(GoogleOneTapSignIn.presentExplicitSignIn)
      .mockResolvedValue(successResponse);

    await expect(requestGoogleIdToken(onBeforePrompt)).resolves.toBe(
      'verified-google-id-token',
    );
    expect(GoogleOneTapSignIn.checkPlayServices).toHaveBeenCalled();
    expect(onBeforePrompt).toHaveBeenCalledTimes(1);
    expect(GoogleOneTapSignIn.presentExplicitSignIn).toHaveBeenCalled();
    expect(
      jest.mocked(GoogleOneTapSignIn.checkPlayServices).mock
        .invocationCallOrder[0],
    ).toBeLessThan(onBeforePrompt.mock.invocationCallOrder[0]);
    expect(onBeforePrompt.mock.invocationCallOrder[0]).toBeLessThan(
      jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mock
        .invocationCallOrder[0],
    );
    expect(GoogleOneTapSignIn.signIn).not.toHaveBeenCalled();
    expect(GoogleOneTapSignIn.createAccount).not.toHaveBeenCalled();
  });

  it('normalizes returned and thrown user cancellation to no token', async () => {
    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockResolvedValue({
      type: 'cancelled',
      data: null,
    });
    await expect(requestGoogleIdToken()).resolves.toBeNull();

    jest.mocked(GoogleOneTapSignIn.presentExplicitSignIn).mockRejectedValue({
      code: statusCodes.SIGN_IN_CANCELLED,
      message: 'cancelled',
    });
    await expect(requestGoogleIdToken()).resolves.toBeNull();
  });

  it('fails locally when required client configuration is absent', async () => {
    env.googleWebClientId = null;

    await expect(requestGoogleIdToken()).rejects.toBeInstanceOf(
      GoogleSignInUnavailableError,
    );
    expect(GoogleOneTapSignIn.checkPlayServices).not.toHaveBeenCalled();
  });

  it('requires the iOS client identifier only on iOS', () => {
    env.googleIosClientId = null;

    expect(configureGoogleSignIn()).toBe(Platform.OS !== 'ios');
  });
});
