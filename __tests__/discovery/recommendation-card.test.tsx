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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
        favoriteDisabled={false}
        favoriteError={false}
        isFavorite={false}
        isFavoritePending={false}
        isRerolling={false}
        onBack={jest.fn()}
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
});
