import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Linking } from 'react-native';

import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';

import { buildRecommendation } from '../../test-support/recommendation.fixture';

describe('RecommendationCard', () => {
  const onMapsOpened = jest.fn();

  beforeEach(() => {
    onMapsOpened.mockClear();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('presents a complete closed result, attribution and Maps action', async () => {
    render(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={jest.fn()}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    expect(screen.getByText('La Cocina de Prueba')).toBeOnTheScreen();
    expect(screen.getByText('4.6 (321)')).toBeOnTheScreen();
    expect(screen.getByText('$$')).toBeOnTheScreen();
    expect(screen.getByText('Cerrado ahora')).toBeOnTheScreen();
    expect(
      screen.getByText('123 Avenida Revolución, Tijuana, B.C.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Resultados de Google Maps')).toBeOnTheScreen();
    expect(screen.getByText('Foto de Fotógrafa de prueba')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://maps.google.com/?cid=55555555-5555-4555-8555-555555555555',
    );
    await waitFor(() => expect(onMapsOpened).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByText('Foto de Fotógrafa de prueba'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.test/author');

    fireEvent.press(screen.getByText('Ver fuente de la foto'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://example.test/source-photo',
    );
  });

  it('expands the weekly schedule for a closed restaurant', () => {
    render(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={jest.fn()}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    expect(screen.queryByText('lunes: 9:00–22:00')).not.toBeOnTheScreen();
    fireEvent.press(screen.getByText('Horario'));
    expect(screen.getByText('lunes: 9:00–22:00')).toBeOnTheScreen();
  });

  it('uses one accessible heart action for saving and removing', () => {
    const onFavoriteToggle = jest.fn();
    const { rerender } = render(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={onFavoriteToggle}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    fireEvent.press(
      screen.getByRole('button', {
        name: 'Guardar La Cocina de Prueba en favoritos',
      }),
    );
    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);

    rerender(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={onFavoriteToggle}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Quitar La Cocina de Prueba de favoritos',
      }),
    ).toBeOnTheScreen();
  });

  it('keeps the result usable when optional metadata is missing', () => {
    render(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={jest.fn()}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation({
          formattedAddress: undefined,
          openingHours: null,
          mapsUri: undefined,
          photo: null,
          priceLevel: undefined,
          rating: undefined,
          userRatingCount: undefined,
        })}
      />,
    );

    expect(screen.getByText('No hay foto disponible')).toBeOnTheScreen();
    expect(screen.queryByText('4.6 (321)')).not.toBeOnTheScreen();
    expect(screen.queryByText('$$')).not.toBeOnTheScreen();
    expect(
      screen.queryByText('123 Avenida Revolución, Tijuana, B.C.'),
    ).not.toBeOnTheScreen();
    expect(screen.queryByText('Cerrado ahora')).not.toBeOnTheScreen();
    expect(screen.getByText('ABRIR EN MAPAS')).toBeOnTheScreen();
    expect(screen.getByText('GIRAR OTRA VEZ')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://www.google.com/maps/search/?api=1&query=32.5149,-117.0382',
    );
  });

  it('shows recovery guidance and does not track Maps when opening fails', async () => {
    jest
      .mocked(Linking.openURL)
      .mockRejectedValue(new Error('Maps unavailable'));

    render(
      <RecommendationCard
        checkInError={null}
        checkInResult={null}
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isCheckInPending={false}
        isRerolling={false}
        onBack={jest.fn()}
        onCheckIn={jest.fn()}
        onFavoriteToggle={jest.fn()}
        onMapsOpened={onMapsOpened}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    fireEvent.press(screen.getByText('ABRIR EN MAPAS'));

    expect(
      await screen.findByText(
        'No pudimos abrir Maps. Revisa que tengas una aplicación de mapas disponible e inténtalo de nuevo.',
      ),
    ).toBeOnTheScreen();
    expect(onMapsOpened).not.toHaveBeenCalled();
  });

  it('shows check-in distance guidance and verified success', () => {
    const commonProps = {
      favoriteDisabled: false,
      favoriteError: false,
      isCheckInPending: false,
      isFavorite: false,
      isFavoritePending: false,
      isRerolling: false,
      onBack: jest.fn(),
      onCheckIn: jest.fn(),
      onFavoriteToggle: jest.fn(),
      onMapsOpened,
      onReroll: jest.fn(),
      result: buildRecommendation(),
    };
    const { rerender } = render(
      <RecommendationCard
        {...commonProps}
        checkInError={null}
        checkInResult={{
          status: 'too_far',
          distanceMeters: 1_250,
          allowedDistanceMeters: 160,
        }}
      />,
    );

    expect(screen.getByText('Aún no estás ahí 📍')).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Estás a 1.3 km del restaurante. Acércate para registrar tu visita.',
      ),
    ).toBeOnTheScreen();

    rerender(
      <RecommendationCard
        {...commonProps}
        checkInError={null}
        checkInResult={{
          status: 'verified',
          visit: {
            id: '88888888-8888-4888-8888-888888888888',
            restaurantId: '55555555-5555-4555-8555-555555555555',
            spinId: '33333333-3333-4333-8333-333333333333',
            checkedInAt: '2026-10-25T12:00:00.000Z',
            verificationDistanceMeters: 42.5,
            locationAccuracyMeters: 8,
            source: 'roulette',
          },
        }}
      />,
    );

    expect(screen.getByText('¡Visita verificada! ✅')).toBeOnTheScreen();
    expect(screen.getByText('VISITA REGISTRADA')).toBeDisabled();
  });
});
