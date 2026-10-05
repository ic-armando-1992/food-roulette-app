export const PRICE_LEVELS = [
  'FREE',
  'INEXPENSIVE',
  'MODERATE',
  'EXPENSIVE',
  'VERY_EXPENSIVE',
] as const;

export type PriceLevel = (typeof PRICE_LEVELS)[number];

export type RandomRecommendationRequest = {
  latitude: number;
  longitude: number;
  countryCode: string;
  allowInternational?: boolean;
  radiusMeters: number;
  cuisine?: string;
  priceLevels?: PriceLevel[];
  minimumRating?: number;
  excludedRestaurantIds?: string[];
  candidatePoolId?: string;
};

export type RestaurantPhotoAuthorAttribution = {
  displayName?: string;
  uri?: string;
  photoUri?: string;
};

export type RestaurantPhoto = {
  url: string;
  authorAttributions: RestaurantPhotoAuthorAttribution[];
  googleMapsUri: string;
};

export type RestaurantOpeningHours = {
  openNow?: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
  weekdayDescriptions: string[];
};

export type RestaurantRecommendation = {
  id: string;
  name: string;
  formattedAddress?: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  primaryType?: string;
  types: string[];
  priceLevel?: PriceLevel;
  rating?: number;
  userRatingCount?: number;
  mapsUri?: string;
  openingHours: RestaurantOpeningHours | null;
  photo: RestaurantPhoto | null;
};

export type RandomRecommendationResponse = {
  recommendation: RestaurantRecommendation;
  candidatePool: {
    id: string;
    expiresAt: string;
    remainingCandidates: number;
  };
  source: 'catalog' | 'provider';
  attribution: {
    provider: string;
    displayText: string;
  } | null;
};
