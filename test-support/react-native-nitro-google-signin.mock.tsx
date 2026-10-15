import { Pressable, Text } from 'react-native';

type SignInResponse = {
  type: 'success' | 'noSavedCredentialFound' | 'cancelled';
  data: { idToken: string } | null;
};

export const GoogleOneTapSignIn = {
  checkPlayServices: jest.fn<Promise<void>, []>().mockResolvedValue(),
  configure: jest.fn(),
  createAccount: jest.fn<Promise<SignInResponse>, []>(),
  presentExplicitSignIn: jest.fn<Promise<SignInResponse>, []>(),
  signIn: jest.fn<Promise<SignInResponse>, []>(),
};

export const statusCodes = {
  SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
} as const;

export function isCancelledResponse(response: SignInResponse): boolean {
  return response.type === 'cancelled';
}

export function isErrorWithCode(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

export function isNoSavedCredentialFoundResponse(
  response: SignInResponse,
): boolean {
  return response.type === 'noSavedCredentialFound';
}

export function isSuccessResponse(
  response: SignInResponse,
): response is SignInResponse & {
  type: 'success';
  data: { idToken: string };
} {
  return response.type === 'success' && response.data !== null;
}

export function GoogleSignInButton({
  accessibilityLabel,
  disabled,
  onPress,
  testID,
}: {
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress?: () => void | Promise<void>;
  testID?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => void onPress?.()}
      testID={testID}
    >
      <Text>Continuar con Google</Text>
    </Pressable>
  );
}
