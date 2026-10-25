import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import { RandomRecommendationResponse } from '@/api/contracts/recommendations';
import { markSpinMapsOpened } from '@/api/endpoints/spins.api';
import { useAuth } from '@/features/auth/providers/AuthProvider';
import {
  hasSeenGoogleLinkPrompt,
  markGoogleLinkPromptSeen,
} from '@/features/auth/services/auth-storage';
import { DiscoverScreen } from '@/features/discovery/screens/DiscoverScreen';

import { buildRecommendation } from '../../test-support/recommendation.fixture';

const mockRequestLocation = jest.fn();
const mockRecommend = jest.fn<
  Promise<RandomRecommendationResponse | null>,
  [unknown]
>();
const mockReset = jest.fn();
const mockTrackProductEvent = jest.fn();
const mockWaitForMinimumSpinDuration = jest.fn();
const mockStopSpin = jest.fn<void, [() => void]>();
const mockPush = jest.fn();
const mockCheckInMutate = jest.fn();
let mockLocationState: unknown;
let mockRecommendationState: Record<string, unknown>;
let mockCheckInState: Record<string, unknown>;

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/discovery/hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({
    requestLocation: mockRequestLocation,
    state: mockLocationState,
  }),
}));

jest.mock('@/features/auth/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/features/auth/services/auth-storage', () => ({
  hasSeenGoogleLinkPrompt: jest.fn(),
  markGoogleLinkPromptSeen: jest.fn(),
}));

jest.mock('@/features/auth/components/GoogleSignInAction', () => ({
  GoogleSignInAction: () => {
    const { Text: NativeText } = require('react-native');

    return <NativeText>Continuar con Google</NativeText>;
  },
}));

jest.mock('@/features/discovery/hooks/useRandomRecommendation', () => ({
  useRandomRecommendation: () => mockRecommendationState,
}));

jest.mock('@/features/favorites/hooks/useFavoriteStatus', () => ({
  useFavoriteStatus: () => ({
    error: null,
    isFavorite: false,
    isPending: false,
    isReady: true,
    toggle: jest.fn(),
  }),
}));

jest.mock('@/features/visits/hooks/useCheckIn', () => ({
  useCheckIn: () => mockCheckInState,
}));

jest.mock('@/api/endpoints/spins.api', () => ({
  markSpinMapsOpened: jest.fn(),
}));

jest.mock('@/features/discovery/utils/waitForMinimumSpinDuration', () => ({
  waitForMinimumSpinDuration: () => mockWaitForMinimumSpinDuration(),
}));

jest.mock('@/core/telemetry/telemetry', () => ({
  createTelemetryId: () => '33333333-3333-4333-8333-333333333333',
  getTelemetryErrorProperties: () => ({ errorKind: 'network' }),
  trackProductEvent: (...args: unknown[]) => mockTrackProductEvent(...args),
}));

jest.mock('@/features/discovery/components/RouletteSpinner', () => {
  const { Pressable, Text: NativeText } = require('react-native');

  return {
    RouletteSpinner: ({
      disabled,
      onSpinRequest,
    }: {
      disabled?: boolean;
      onSpinRequest?: () => void;
    }) => (
      <Pressable
        accessibilityLabel="Girar la ruleta"
        accessibilityRole="button"
        disabled={disabled}
        onPress={onSpinRequest}
      >
        <NativeText>Ruleta lista</NativeText>
      </Pressable>
    ),
  };
});

jest.mock('@/features/discovery/components/RouletteLoadingState', () => {
  const { useEffect } = require('react');
  const { Text: NativeText } = require('react-native');

  return {
    RouletteLoadingState: ({
      onSpinStopped,
      spinPhase,
    }: {
      onSpinStopped: () => void;
      spinPhase: 'spinning' | 'stopping';
    }) => {
      useEffect(() => {
        if (spinPhase === 'stopping') {
          mockStopSpin(onSpinStopped);
        }
      }, [onSpinStopped, spinPhase]);

      return <NativeText>Buscando un restaurante cercano</NativeText>;
    },
  };
});

jest.mock('@/features/discovery/components/RecommendationCard', () => {
  const { Pressable, Text: NativeText, View } = require('react-native');

  return {
    RecommendationCard: ({
      onBack,
      onCheckIn,
      onMapsOpened,
      onReroll,
      result,
    }: {
      onBack: () => void;
      onCheckIn: () => void;
      onMapsOpened: () => void;
      onReroll: () => void;
      result: RandomRecommendationResponse;
    }) => (
      <View>
        <NativeText>{result.recommendation.name}</NativeText>
        <Pressable accessibilityRole="button" onPress={onReroll}>
          <NativeText>GIRAR OTRA VEZ</NativeText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <NativeText>VOLVER</NativeText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onMapsOpened}>
          <NativeText>ABRIR EN MAPAS</NativeText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onCheckIn}>
          <NativeText>HACER CHECK-IN</NativeText>
        </Pressable>
      </View>
    ),
  };
});

describe('DiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWaitForMinimumSpinDuration.mockResolvedValue(undefined);
    mockStopSpin.mockImplementation((onStopped) => onStopped());
    mockLocationState = {
      status: 'granted',
      coordinates: {
        countryCode: 'MX',
        latitude: 32.5149,
        longitude: -117.0382,
      },
      label: 'Tijuana, Baja California',
    };
    mockRecommendationState = {
      error: null,
      isError: false,
      isPending: false,
      recommend: mockRecommend,
      reset: mockReset,
    };
    mockCheckInState = {
      data: null,
      error: null,
      isError: false,
      isPending: false,
      mutate: mockCheckInMutate,
      reset: jest.fn(),
    };
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: false,
      status: 'ready',
      user: {
        id: '11111111-1111-4111-8111-111111111111',
        isGuest: true,
        displayName: null,
        avatarUrl: null,
        createdAt: '2030-01-01T00:00:00.000Z',
      },
    });
    jest.mocked(hasSeenGoogleLinkPrompt).mockResolvedValue(false);
    jest.mocked(markGoogleLinkPromptSeen).mockResolvedValue();
    jest.mocked(markSpinMapsOpened).mockResolvedValue();
  });

  it('keeps the profile entry visible without showing a registration card', () => {
    render(<DiscoverScreen />);

    expect(
      screen.getByRole('button', { name: 'Abrir cuenta de invitado' }),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Guarda tu progreso')).not.toBeOnTheScreen();
    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();
  });

  it('opens the Favorites screen from the home header', () => {
    render(<DiscoverScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Abrir favoritos' }));

    expect(mockPush).toHaveBeenCalledWith('/favorites');
  });

  it('opens verified visits from the home header', () => {
    render(<DiscoverScreen />);

    fireEvent.press(screen.getByRole('button', { name: 'Abrir mis visitas' }));

    expect(mockPush).toHaveBeenCalledWith('/visits');
  });

  it('shows a dismissible recovery notice after an invalid account session', () => {
    const dismissSessionRecoveryNotice = jest.fn();
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice,
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: true,
      status: 'ready',
      user: {
        id: '33333333-3333-4333-8333-333333333333',
        isGuest: true,
        displayName: null,
        avatarUrl: null,
        createdAt: '2030-01-01T00:00:00.000Z',
      },
    });

    render(<DiscoverScreen />);

    expect(screen.getByText('Tu sesión anterior terminó')).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Ocultar aviso de sesión' }),
    );
    expect(dismissSessionRecoveryNotice).toHaveBeenCalledTimes(1);
  });

  it('opens guest account access from the header', () => {
    render(<DiscoverScreen />);

    fireEvent.press(
      screen.getByRole('button', { name: 'Abrir cuenta de invitado' }),
    );

    expect(screen.getByText('Cuenta de invitado')).toBeOnTheScreen();
    expect(screen.getByText('Continuar con Google')).toBeOnTheScreen();
  });

  it('requests location on mount and presents recovery actions when denied', async () => {
    mockLocationState = { status: 'denied' };

    render(<DiscoverScreen />);

    await waitFor(() => expect(mockRequestLocation).toHaveBeenCalledTimes(1));
    expect(screen.getByText('ABRIR AJUSTES')).toBeOnTheScreen();
    fireEvent.press(screen.getByText('INTENTAR DE NUEVO'));
    expect(mockRequestLocation).toHaveBeenCalledTimes(2);
  });

  it('sends current-country context and shows a successful initial result', async () => {
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));

    expect(
      screen.getByText('Buscando un restaurante cercano'),
    ).toBeOnTheScreen();
    await screen.findByText('La Cocina de Prueba');
    expect(
      screen.queryByRole('button', { name: 'Abrir cuenta de invitado' }),
    ).not.toBeOnTheScreen();
    expect(mockRecommend).toHaveBeenCalledWith({
      allowInternational: false,
      countryCode: 'MX',
      latitude: 32.5149,
      longitude: -117.0382,
      radiusMeters: 3_000,
      spinId: '33333333-3333-4333-8333-333333333333',
    });
    expect(mockTrackProductEvent).toHaveBeenCalledWith(
      'roulette_spin_started',
      expect.objectContaining({ reroll: false, radiusMeters: 3_000 }),
    );
    expect(mockTrackProductEvent).toHaveBeenCalledWith(
      'roulette_spin_result',
      expect.objectContaining({
        restaurantId: '55555555-5555-4555-8555-555555555555',
        reroll: false,
      }),
    );
  });

  it('starts the same recommendation flow by pressing the roulette', async () => {
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByRole('button', { name: 'Girar la ruleta' }));

    await screen.findByText('La Cocina de Prueba');
    expect(mockRecommend).toHaveBeenCalledTimes(1);
    expect(mockRecommend).toHaveBeenCalledWith({
      allowInternational: false,
      countryCode: 'MX',
      latitude: 32.5149,
      longitude: -117.0382,
      radiusMeters: 3_000,
      spinId: '33333333-3333-4333-8333-333333333333',
    });
  });

  it('marks the displayed spin after Maps opens', async () => {
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await screen.findByText('La Cocina de Prueba');
    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));

    expect(markSpinMapsOpened).toHaveBeenCalledWith(
      '33333333-3333-4333-8333-333333333333',
    );
  });

  it('starts a check-in for the displayed spin and restaurant', async () => {
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await screen.findByText('La Cocina de Prueba');
    fireEvent.press(screen.getByText('HACER CHECK-IN'));

    expect(mockCheckInMutate).toHaveBeenCalledWith({
      visitId: '33333333-3333-4333-8333-333333333333',
      spinId: '33333333-3333-4333-8333-333333333333',
      restaurantId: '55555555-5555-4555-8555-555555555555',
    });
  });

  it('shows one contextual Google invitation after the first successful spin', async () => {
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('GIRAR RULETA'));

    expect(
      await screen.findByText('¿Quieres conservar tu progreso?'),
    ).toBeOnTheScreen();
    expect(screen.getByText('La Cocina de Prueba')).toBeOnTheScreen();
    expect(screen.getByText('Continuar con Google')).toBeOnTheScreen();
    await waitFor(() =>
      expect(markGoogleLinkPromptSeen).toHaveBeenCalledTimes(1),
    );

    fireEvent.press(screen.getByText('Ahora no'));
    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();

    fireEvent.press(screen.getByText('GIRAR OTRA VEZ'));
    await screen.findByText('La Cocina de Prueba');
    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();
  });

  it('does not repeat a previously shown invitation', async () => {
    jest.mocked(hasSeenGoogleLinkPrompt).mockResolvedValue(true);
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await screen.findByText('La Cocina de Prueba');

    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();
    expect(markGoogleLinkPromptSeen).not.toHaveBeenCalled();
  });

  it('does not invite an authenticated Google user', async () => {
    jest.mocked(useAuth).mockReturnValue({
      beginGoogleAccountUpgrade: jest.fn(),
      confirmGoogleAccountSwitch: jest.fn(),
      dismissSessionRecoveryNotice: jest.fn(),
      logout: jest.fn(),
      retry: jest.fn(),
      sessionRecoveryNoticeVisible: false,
      status: 'ready',
      user: {
        id: '22222222-2222-4222-8222-222222222222',
        isGuest: false,
        displayName: 'Armando Pérez',
        avatarUrl: 'https://example.test/armando.png',
        createdAt: '2030-01-01T00:00:00.000Z',
      },
    });
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await screen.findByText('La Cocina de Prueba');

    expect(
      screen.queryByText('¿Quieres conservar tu progreso?'),
    ).not.toBeOnTheScreen();
    expect(markGoogleLinkPromptSeen).not.toHaveBeenCalled();
  });

  it('keeps the loading state visible for the duration of a slow request', async () => {
    let resolveRequest:
      ((value: RandomRecommendationResponse) => void) | undefined;
    mockRecommend.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<DiscoverScreen />);
    const spinButton = screen.getByText('GIRAR RULETA');
    fireEvent.press(spinButton);
    fireEvent.press(spinButton);

    expect(
      screen.getByText('Buscando un restaurante cercano'),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Abrir cuenta de invitado' }),
    ).toBeDisabled();
    expect(screen.queryByText('La Cocina de Prueba')).not.toBeOnTheScreen();
    expect(mockRecommend).toHaveBeenCalledTimes(1);

    resolveRequest?.(buildRecommendation());
    await screen.findByText('La Cocina de Prueba');
  });

  it('waits for the minimum duration and stop animation before revealing a fast result', async () => {
    let finishMinimumSpin: (() => void) | undefined;
    let finishStopAnimation: (() => void) | undefined;
    mockWaitForMinimumSpinDuration.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishMinimumSpin = resolve;
        }),
    );
    mockStopSpin.mockImplementation((onStopped) => {
      finishStopAnimation = onStopped;
    });
    mockRecommend.mockResolvedValue(buildRecommendation());

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));

    await waitFor(() => expect(mockRecommend).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('La Cocina de Prueba')).not.toBeOnTheScreen();

    finishMinimumSpin?.();
    await waitFor(() => expect(mockStopSpin).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('La Cocina de Prueba')).not.toBeOnTheScreen();

    finishStopAnimation?.();
    await screen.findByText('La Cocina de Prueba');
  });

  it('rerolls with the existing pool and excludes the previous restaurant', async () => {
    const secondResult = buildRecommendation(
      {
        id: '66666666-6666-4666-8666-666666666666',
        name: 'Segundo Restaurante',
      },
      {
        candidatePool: {
          id: '77777777-7777-4777-8777-777777777777',
          expiresAt: '2030-01-01T00:15:00.000Z',
          remainingCandidates: 3,
        },
      },
    );
    mockRecommend
      .mockResolvedValueOnce(buildRecommendation())
      .mockResolvedValueOnce(secondResult);

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await screen.findByText('La Cocina de Prueba');
    fireEvent.press(screen.getByText('GIRAR OTRA VEZ'));
    await screen.findByText('Segundo Restaurante');

    expect(mockRecommend).toHaveBeenNthCalledWith(2, {
      allowInternational: false,
      candidatePoolId: '77777777-7777-4777-8777-777777777777',
      countryCode: 'MX',
      excludedRestaurantIds: ['55555555-5555-4555-8555-555555555555'],
      latitude: 32.5149,
      longitude: -117.0382,
      radiusMeters: 3_000,
      spinId: '33333333-3333-4333-8333-333333333333',
    });
    expect(mockTrackProductEvent).toHaveBeenCalledWith('roulette_spin_again', {
      restaurantId: '55555555-5555-4555-8555-555555555555',
    });
  });

  it('allows retry after a failed recommendation', async () => {
    mockRecommendationState.isError = true;
    mockRecommendationState.error = new Error('offline');
    mockRecommend
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(buildRecommendation());

    render(<DiscoverScreen />);
    expect(screen.getByText('No pudimos elegir un lugar')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('GIRAR RULETA'));
    await waitFor(() => expect(mockRecommend).toHaveBeenCalledTimes(1));
    expect(mockTrackProductEvent).toHaveBeenCalledWith(
      'roulette_spin_failed',
      expect.objectContaining({ errorKind: 'network', reroll: false }),
    );
    await waitFor(() => expect(screen.getByText('GIRAR RULETA')).toBeEnabled());
    fireEvent.press(screen.getByText('GIRAR RULETA'));

    await screen.findByText('La Cocina de Prueba');
    expect(mockRecommend).toHaveBeenCalledTimes(2);
  });
});
