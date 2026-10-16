import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

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

const guestUser = {
  id: '11111111-1111-4111-8111-111111111111',
  isGuest: true,
  createdAt: '2030-01-01T00:00:00.000Z',
};

function mockAuthUser(user = guestUser) {
  jest.mocked(useAuth).mockReturnValue({
    beginGoogleAccountUpgrade: jest.fn(),
    confirmGoogleAccountSwitch: jest.fn(),
    retry: jest.fn(),
    status: 'ready',
    user,
  });
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
