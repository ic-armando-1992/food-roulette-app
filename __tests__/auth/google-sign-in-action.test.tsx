import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';

import { useNotificationStore } from '@/core/notifications/notification.store';
import { GoogleSignInAction } from '@/features/auth/components/GoogleSignInAction';
import { AUTH_ERROR_MESSAGES } from '@/features/auth/constants/auth.constants';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  configureGoogleSignIn,
  requestGoogleIdToken,
} from '@/features/auth/services/google-sign-in';

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/features/auth/services/google-sign-in', () => ({
  configureGoogleSignIn: jest.fn(),
  GoogleSignInUnavailableError: class extends Error {},
  requestGoogleIdToken: jest.fn(),
}));

const guestUser = {
  id: '11111111-1111-4111-8111-111111111111',
  isGuest: true,
  displayName: null,
  avatarUrl: null,
  createdAt: '2030-01-01T00:00:00.000Z',
};

describe('GoogleSignInAction', () => {
  const beginGoogleAccountUpgrade = jest.fn();
  const confirmGoogleAccountSwitch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(configureGoogleSignIn).mockReturnValue(true);
    jest
      .mocked(requestGoogleIdToken)
      .mockResolvedValue('verified-google-id-token');
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade,
      confirmGoogleAccountSwitch,
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: false,
      status: 'ready',
      user: guestUser,
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('links an unclaimed Google identity and reports completion', async () => {
    beginGoogleAccountUpgrade.mockResolvedValue({
      status: 'linked',
      user: { ...guestUser, isGuest: false },
    });
    const onLinked = jest.fn();
    render(<GoogleSignInAction onLinked={onLinked} />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(beginGoogleAccountUpgrade).toHaveBeenCalledWith(
        'verified-google-id-token',
      ),
    );
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
    expect(useNotificationStore.getState().queue[0]).toMatchObject({
      description: 'Tu progreso quedó vinculado a tu cuenta de Google.',
      message: 'Cuenta vinculada',
      type: 'success',
    });
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('waits for the parent surface to close before opening Google', async () => {
    let finishClosing: (() => void) | undefined;
    const onBeforeSignIn = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishClosing = resolve;
        }),
    );
    jest
      .mocked(requestGoogleIdToken)
      .mockImplementation(async (beforePrompt) => {
        await beforePrompt?.();
        return 'verified-google-id-token';
      });
    render(<GoogleSignInAction onBeforeSignIn={onBeforeSignIn} />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() => expect(onBeforeSignIn).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Abriendo Google…')).toBeOnTheScreen();

    await act(async () => finishClosing?.());
    await waitFor(() =>
      expect(beginGoogleAccountUpgrade).toHaveBeenCalledWith(
        'verified-google-id-token',
      ),
    );
  });

  it('keeps the guest unchanged when the conflict dialog is cancelled', async () => {
    beginGoogleAccountUpgrade.mockResolvedValue({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });
    const alert = jest.spyOn(Alert, 'alert');
    render(<GoogleSignInAction />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));
    await waitFor(() => expect(alert).toHaveBeenCalled());

    const buttons = alert.mock.calls[0]?.[2];
    expect(alert).toHaveBeenCalledWith(
      '¿Combinar tu progreso?',
      'Esta cuenta de Google ya existe. Si continúas, tus favoritos, visitas y progreso de invitado se agregarán a esa cuenta.',
      expect.any(Array),
      { cancelable: true },
    );
    expect(buttons?.[0]).toEqual(
      expect.objectContaining({ text: 'Cancelar', style: 'cancel' }),
    );
    expect(buttons?.[1]).toEqual(
      expect.objectContaining({ text: 'Combinar y continuar' }),
    );
    buttons?.[0]?.onPress?.();
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
    expect(jest.mocked(useAuth).mock.results[0]?.value.user).toBe(guestUser);
  });

  it('merges favorites and reports completion only after confirmation', async () => {
    beginGoogleAccountUpgrade.mockResolvedValue({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });
    confirmGoogleAccountSwitch.mockResolvedValue({
      ...guestUser,
      id: '22222222-2222-4222-8222-222222222222',
      isGuest: false,
    });
    const alert = jest.spyOn(Alert, 'alert');
    const onLinked = jest.fn();
    render(<GoogleSignInAction onLinked={onLinked} />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));
    await waitFor(() => expect(alert).toHaveBeenCalled());
    await act(async () => {
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
    });

    await waitFor(() =>
      expect(confirmGoogleAccountSwitch).toHaveBeenCalledWith('C'.repeat(43)),
    );
    expect(onLinked).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the native Google prompt is cancelled', async () => {
    jest.mocked(requestGoogleIdToken).mockResolvedValue(null);
    render(<GoogleSignInAction />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() => expect(requestGoogleIdToken).toHaveBeenCalled());
    expect(beginGoogleAccountUpgrade).not.toHaveBeenCalled();
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
  });

  it('shows only a generic product error when sign-in fails', async () => {
    jest
      .mocked(requestGoogleIdToken)
      .mockRejectedValue(new Error('sensitive provider detail'));
    render(<GoogleSignInAction />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(useNotificationStore.getState().queue[0]).toMatchObject({
        description: AUTH_ERROR_MESSAGES.googleSignInFailed,
        message: 'No pudimos iniciar sesión',
        type: 'error',
      }),
    );
    expect(JSON.stringify(useNotificationStore.getState().queue)).not.toContain(
      'sensitive provider detail',
    );
  });
});
