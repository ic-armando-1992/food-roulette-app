import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { RecommendationCard } from '@/features/discovery/components/RecommendationCard';

import { buildRecommendation } from '../../test-support/recommendation.fixture';

describe('RecommendationCard', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('presents a complete closed result, attribution and Maps action', () => {
    render(
      <RecommendationCard
        isRerolling={false}
        onBack={jest.fn()}
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
      'https://maps.google.com/?cid=restaurant-1',
    );

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
        isRerolling={false}
        onBack={jest.fn()}
        onReroll={jest.fn()}
        result={buildRecommendation()}
      />,
    );

    expect(screen.queryByText('lunes: 9:00–22:00')).not.toBeOnTheScreen();
    fireEvent.press(screen.getByText('Horario'));
    expect(screen.getByText('lunes: 9:00–22:00')).toBeOnTheScreen();
  });

  it('keeps the result usable when optional metadata is missing', () => {
    render(
      <RecommendationCard
        isRerolling={false}
        onBack={jest.fn()}
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
});
