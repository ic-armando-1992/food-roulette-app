import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import { RandomRecommendationResponse } from '@/api/contracts/recommendations';
import { DiscoverScreen } from '@/features/discovery/screens/DiscoverScreen';

import { buildRecommendation } from '../../test-support/recommendation.fixture';

const mockRequestLocation = jest.fn();
const mockRecommend = jest.fn<
  Promise<RandomRecommendationResponse | null>,
  [unknown]
>();
const mockReset = jest.fn();
let mockLocationState: unknown;
let mockRecommendationState: Record<string, unknown>;

jest.mock('@/features/discovery/hooks/useCurrentLocation', () => ({
  useCurrentLocation: () => ({
    requestLocation: mockRequestLocation,
    state: mockLocationState,
  }),
}));

jest.mock('@/features/discovery/hooks/useRandomRecommendation', () => ({
  useRandomRecommendation: () => mockRecommendationState,
}));

jest.mock('@/features/discovery/components/RouletteSpinner', () => {
  const { Text: NativeText } = require('react-native');

  return { RouletteSpinner: () => <NativeText>Ruleta lista</NativeText> };
});

jest.mock('@/features/discovery/components/RouletteLoadingState', () => {
  const { Text: NativeText } = require('react-native');

  return {
    RouletteLoadingState: () => (
      <NativeText>Buscando un restaurante cercano</NativeText>
    ),
  };
});

jest.mock('@/features/discovery/components/RecommendationCard', () => {
  const { Pressable, Text: NativeText, View } = require('react-native');

  return {
    RecommendationCard: ({
      onBack,
      onReroll,
      result,
    }: {
      onBack: () => void;
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
      </View>
    ),
  };
});

describe('DiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    expect(mockRecommend).toHaveBeenCalledWith({
      allowInternational: false,
      countryCode: 'MX',
      latitude: 32.5149,
      longitude: -117.0382,
      radiusMeters: 3_000,
    });
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
    expect(screen.queryByText('La Cocina de Prueba')).not.toBeOnTheScreen();
    expect(mockRecommend).toHaveBeenCalledTimes(1);

    resolveRequest?.(buildRecommendation());
    await screen.findByText('La Cocina de Prueba');
  });

  it('rerolls with the existing pool and excludes the previous restaurant', async () => {
    const secondResult = buildRecommendation(
      { id: 'restaurant-2', name: 'Segundo Restaurante' },
      {
        candidatePool: {
          id: 'pool-1',
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
      candidatePoolId: 'pool-1',
      countryCode: 'MX',
      excludedRestaurantIds: ['restaurant-1'],
      latitude: 32.5149,
      longitude: -117.0382,
      radiusMeters: 3_000,
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
    await waitFor(() => expect(screen.getByText('GIRAR RULETA')).toBeEnabled());
    fireEvent.press(screen.getByText('GIRAR RULETA'));

    await screen.findByText('La Cocina de Prueba');
    expect(mockRecommend).toHaveBeenCalledTimes(2);
  });
});
