import {
  RandomRecommendationResponse,
  RestaurantRecommendation,
} from '@/api/contracts/recommendations';

export function buildRecommendation(
  recommendationOverrides: Partial<RestaurantRecommendation> = {},
  responseOverrides: Partial<RandomRecommendationResponse> = {},
): RandomRecommendationResponse {
  return {
    recommendation: {
      id: 'restaurant-1',
      name: 'La Cocina de Prueba',
      formattedAddress: '123 Avenida Revolución, Tijuana, B.C.',
      latitude: 32.5149,
      longitude: -117.0382,
      distanceMeters: 850,
      primaryType: 'mexican_restaurant',
      types: ['mexican_restaurant', 'restaurant'],
      priceLevel: 'MODERATE',
      rating: 4.6,
      userRatingCount: 321,
      mapsUri: 'https://maps.google.com/?cid=restaurant-1',
      openingHours: {
        openNow: false,
        nextOpenTime: '2030-01-02T17:00:00.000Z',
        weekdayDescriptions: ['lunes: 9:00–22:00'],
      },
      photo: {
        url: '/v1/restaurants/restaurant-1/photos/photo-1',
        authorAttributions: [
          {
            displayName: 'Fotógrafa de prueba',
            uri: 'https://example.test/author',
          },
        ],
        googleMapsUri: 'https://example.test/source-photo',
      },
      ...recommendationOverrides,
    },
    candidatePool: {
      id: 'pool-1',
      expiresAt: '2030-01-01T00:15:00.000Z',
      remainingCandidates: 4,
    },
    source: 'provider',
    attribution: {
      provider: 'google_places',
      displayText: 'Google Maps',
    },
    ...responseOverrides,
  };
}
