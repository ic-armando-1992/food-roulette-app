import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AUTH_SECURE_STORE_KEYS } from '../constants/auth.constants';

export async function getOrCreateGuestCredential(): Promise<string> {
  const stored = await SecureStore.getItemAsync(
    AUTH_SECURE_STORE_KEYS.guestCredential,
  );

  if (stored) {
    return stored;
  }

  return replaceGuestCredential();
}

export async function replaceGuestCredential(): Promise<string> {
  const credential = Crypto.randomUUID();
  await SecureStore.setItemAsync(
    AUTH_SECURE_STORE_KEYS.guestCredential,
    credential,
  );
  return credential;
}

export function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_SECURE_STORE_KEYS.refreshToken);
}

export function storeRefreshToken(refreshToken: string): Promise<void> {
  return SecureStore.setItemAsync(
    AUTH_SECURE_STORE_KEYS.refreshToken,
    refreshToken,
  );
}
