import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
import { GoogleAccountCard } from '@/features/auth/components/GoogleAccountCard';
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
  createdAt: '2030-01-01T00:00:00.000Z',
};

describe('GoogleAccountCard', () => {
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
      retry: jest.fn(),
      status: 'ready',
      user: guestUser,
    });
  });

  it('links an unclaimed Google identity without asking to switch accounts', async () => {
    beginGoogleAccountUpgrade.mockResolvedValue({
      status: 'linked',
      user: { ...guestUser, isGuest: false },
    });
    const alert = jest.spyOn(Alert, 'alert');
    render(<GoogleAccountCard />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(beginGoogleAccountUpgrade).toHaveBeenCalledWith(
        'verified-google-id-token',
      ),
    );
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      'Cuenta vinculada',
      'Tu progreso quedó vinculado a tu cuenta de Google.',
    );
  });

  it('keeps the guest unchanged when the conflict dialog is cancelled', async () => {
    beginGoogleAccountUpgrade.mockResolvedValue({
      status: 'conflict',
      confirmationToken: 'C'.repeat(43),
    });
    const alert = jest.spyOn(Alert, 'alert');
    render(<GoogleAccountCard />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));
    await waitFor(() => expect(alert).toHaveBeenCalled());

    const buttons = alert.mock.calls[0]?.[2];
    expect(buttons?.[0]).toEqual(
      expect.objectContaining({ text: 'Cancelar', style: 'cancel' }),
    );
    buttons?.[0]?.onPress?.();
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
    expect(jest.mocked(useAuth).mock.results[0]?.value.user).toBe(guestUser);
  });

  it('switches only when the user confirms the conflict dialog', async () => {
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
    render(<GoogleAccountCard />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));
    await waitFor(() => expect(alert).toHaveBeenCalled());
    await act(async () => {
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
    });

    await waitFor(() =>
      expect(confirmGoogleAccountSwitch).toHaveBeenCalledWith('C'.repeat(43)),
    );
  });

  it('does nothing when the native Google prompt is cancelled', async () => {
    jest.mocked(requestGoogleIdToken).mockResolvedValue(null);
    render(<GoogleAccountCard />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() => expect(requestGoogleIdToken).toHaveBeenCalled());
    expect(beginGoogleAccountUpgrade).not.toHaveBeenCalled();
    expect(confirmGoogleAccountSwitch).not.toHaveBeenCalled();
  });

  it('shows only a generic product error when sign-in fails', async () => {
    jest
      .mocked(requestGoogleIdToken)
      .mockRejectedValue(new Error('sensitive provider detail'));
    const alert = jest.spyOn(Alert, 'alert');
    render(<GoogleAccountCard />);

    fireEvent.press(screen.getByTestId('google-sign-in-button'));

    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        'No pudimos iniciar sesión',
        AUTH_ERROR_MESSAGES.googleSignInFailed,
      ),
    );
    expect(JSON.stringify(alert.mock.calls)).not.toContain(
      'sensitive provider detail',
    );
  });
});
