import { ApiError } from '@/api/client';
import { getRecommendationErrorMessage } from '@/features/discovery/utils/getRecommendationErrorMessage';

describe('getRecommendationErrorMessage', () => {
  it.each([
    [
      new ApiError('network'),
      'No pudimos conectarnos al servicio de restaurantes.',
    ],
    [new ApiError('timeout'), 'La búsqueda tardó demasiado.'],
    [
      new ApiError('http', 404),
      'No encontramos restaurantes cercanos con esas opciones.',
    ],
    [
      new ApiError('http', 503),
      'El servicio de restaurantes no está disponible temporalmente.',
    ],
  ])('returns safe product copy for %#', (error, expectedText) => {
    expect(getRecommendationErrorMessage(error)).toContain(expectedText);
  });
});
