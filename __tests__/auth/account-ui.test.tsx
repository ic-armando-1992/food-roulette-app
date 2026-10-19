import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { AuthUser } from '@/api/contracts/auth';
import { AccountButton } from '@/features/auth/components/AccountButton';
import { AccountModal } from '@/features/auth/components/AccountModal';
import { useAuth } from '@/features/auth/providers/AuthProvider';

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/features/auth/components/GoogleSignInAction', () => ({
  GoogleSignInAction: () => {
    const { Pressable, Text } = require('react-native');

    return (
      <Pressable accessibilityRole="button">
        <Text>Continuar con Google</Text>
      </Pressable>
    );
  },
}));

const guestUser: AuthUser = {
  id: '11111111-1111-4111-8111-111111111111',
  isGuest: true,
  displayName: null,
  avatarUrl: null,
  createdAt: '2030-01-01T00:00:00.000Z',
};

function mockAuthUser(user = guestUser) {
  const logout = jest.fn().mockResolvedValue({
    guestReady: true,
    remoteRevoked: true,
    user: guestUser,
  });
  jest.mocked(useAuth).mockReturnValue({
    beginGoogleAccountUpgrade: jest.fn(),
    confirmGoogleAccountSwitch: jest.fn(),
    dismissSessionRecoveryNotice: jest.fn(),
    logout,
    retry: jest.fn(),
    sessionRecoveryNoticeVisible: false,
    status: 'ready',
    user,
  });
  return { logout };
}

describe('account UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser();
  });

  afterEach(() => jest.restoreAllMocks());

  it('shows an accessible outlined profile entry for a guest', () => {
    const onPress = jest.fn();
    render(<AccountButton onPress={onPress} />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Abrir cuenta de invitado' }),
    );

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('opens the guest account content with Google Sign-In', () => {
    render(<AccountModal onClose={jest.fn()} visible />);

    expect(screen.getByText('Cuenta de invitado')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Continuar con Google' }),
    ).toBeOnTheScreen();
  });

  it('shows Google account status and an accessible avatar fallback', () => {
    mockAuthUser({ ...guestUser, isGuest: false });
    render(
      <>
        <AccountButton onPress={jest.fn()} />
        <AccountModal onClose={jest.fn()} visible />
      </>,
    );

    expect(
      screen.getByRole('button', { name: 'Abrir cuenta de Google' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Cuenta de Google')).toBeOnTheScreen();
    expect(screen.getByTestId('account-avatar-fallback')).toBeOnTheScreen();
    expect(screen.queryByText('Continuar con Google')).not.toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Cerrar la sesión de Google' }),
    ).toBeOnTheScreen();
  });

  it('shows the Google profile name and photo in the account entry', () => {
    const onPress = jest.fn();
    mockAuthUser({
      ...guestUser,
      isGuest: false,
      displayName: 'Armando Pérez',
      avatarUrl: 'https://example.test/armando.png',
    });
    render(
      <>
        <AccountButton onPress={onPress} />
        <AccountModal onClose={jest.fn()} visible />
      </>,
    );

    expect(screen.getByText('Armando Pérez')).toBeOnTheScreen();
    expect(screen.getByTestId('account-button-avatar-image')).toBeOnTheScreen();
    expect(screen.getByTestId('account-avatar-image')).toBeOnTheScreen();
    expect(
      screen.queryByTestId('account-avatar-fallback'),
    ).not.toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('account-button-avatar-image'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('confirms logout before creating the new guest session', async () => {
    const googleUser = { ...guestUser, isGuest: false };
    const { logout } = mockAuthUser(googleUser);
    const alert = jest.spyOn(ReactNative.Alert, 'alert');
    const onClose = jest.fn();
    render(<AccountModal onClose={onClose} visible />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Cerrar la sesión de Google' }),
    );

    expect(alert).toHaveBeenCalledWith(
      '¿Cerrar sesión?',
      'Tu progreso vinculado a Google permanecerá guardado. Podrás recuperarlo cuando vuelvas a iniciar sesión.',
      expect.any(Array),
    );
    expect(logout).not.toHaveBeenCalled();

    await act(async () => {
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
    });

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not claim remote revocation when logout completes only locally', async () => {
    const googleUser = { ...guestUser, isGuest: false };
    const { logout } = mockAuthUser(googleUser);
    logout.mockResolvedValue({
      guestReady: true,
      remoteRevoked: false,
      user: guestUser,
    });
    const alert = jest.spyOn(ReactNative.Alert, 'alert');
    render(<AccountModal onClose={jest.fn()} visible />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Cerrar la sesión de Google' }),
    );
    await act(async () => {
      alert.mock.calls[0]?.[2]?.[1]?.onPress?.();
    });

    await waitFor(() => expect(alert).toHaveBeenCalledTimes(2));
    expect(alert).toHaveBeenLastCalledWith(
      'Sesión cerrada en este dispositivo',
      expect.stringContaining('no pudimos confirmar la revocación remota'),
    );
  });

  it('keeps the account content scrollable on a compact screen', () => {
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      fontScale: 1,
      height: 480,
      scale: 1,
      width: 320,
    });

    render(<AccountModal onClose={jest.fn()} visible />);

    expect(screen.getByTestId('account-modal-scroll')).toBeOnTheScreen();
    expect(screen.getByText('Continuar con Google')).toBeOnTheScreen();
  });
});
