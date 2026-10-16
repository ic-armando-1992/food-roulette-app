import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AUTH_SECURE_STORE_KEYS } from '@/features/auth/constants/auth.constants';
import {
  getOrCreateGuestCredential,
  hasSeenGoogleLinkPrompt,
  markGoogleLinkPromptSeen,
  replaceGuestCredential,
} from '@/features/auth/services/auth-storage';

jest.mock('expo-crypto', () => ({ randomUUID: jest.fn() }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

describe('auth secure storage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reuses the guest credential from SecureStore', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('stored-guest');

    await expect(getOrCreateGuestCredential()).resolves.toBe('stored-guest');

    expect(Crypto.randomUUID).not.toHaveBeenCalled();
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it('persists a cryptographically generated guest credential before use', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
    jest
      .mocked(Crypto.randomUUID)
      .mockReturnValue('33333333-3333-4333-8333-333333333333');
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue();

    await expect(getOrCreateGuestCredential()).resolves.toBe(
      '33333333-3333-4333-8333-333333333333',
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_SECURE_STORE_KEYS.guestCredential,
      '33333333-3333-4333-8333-333333333333',
    );
  });

  it('replaces a server-revoked installation credential with a fresh value', async () => {
    jest
      .mocked(Crypto.randomUUID)
      .mockReturnValue('44444444-4444-4444-8444-444444444444');
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue();

    await expect(replaceGuestCredential()).resolves.toBe(
      '44444444-4444-4444-8444-444444444444',
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_SECURE_STORE_KEYS.guestCredential,
      '44444444-4444-4444-8444-444444444444',
    );
  });

  it('persists whether the contextual Google invitation was already shown', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);
    jest.mocked(SecureStore.setItemAsync).mockResolvedValue();

    await expect(hasSeenGoogleLinkPrompt()).resolves.toBe(false);
    await markGoogleLinkPromptSeen();

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
      AUTH_SECURE_STORE_KEYS.googleLinkPromptSeen,
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      AUTH_SECURE_STORE_KEYS.googleLinkPromptSeen,
      'true',
    );
  });

  it('recognizes a previously shown Google invitation', async () => {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValue('true');

    await expect(hasSeenGoogleLinkPrompt()).resolves.toBe(true);
  });
});
