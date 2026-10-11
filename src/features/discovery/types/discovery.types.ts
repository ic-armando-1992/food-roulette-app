import {
  RandomRecommendationResponse,
  RestaurantOpeningHours,
  RestaurantPhotoAuthorAttribution,
} from '@/api/contracts/recommendations';

export type DiscoveryView = 'home' | 'result';

export type BrandHeaderProps = { showSettings?: boolean };
export type ErrorMessageProps = { message: string };

export type GeographicCoordinates = {
  latitude: number;
  longitude: number;
};

export type Coordinates = GeographicCoordinates & {
  countryCode: string;
};

export type CurrentLocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'granted'; coordinates: Coordinates; label: string }
  | { status: 'denied' }
  | { status: 'error' };

export type ResolvedLocationContext = {
  countryCode: string;
  label: string;
};

export type DiscoveryStore = {
  radiusMeters: number;
  setRadiusMeters: (radiusMeters: number) => void;
};

export type LocationPillProps = { state: CurrentLocationState };

export type RadiusSelectorProps = {
  disabled?: boolean;
  radiusMeters: number;
  onChange: (radiusMeters: number) => void;
};

export type RouletteSpinnerProps = { spinning?: boolean };

export type CartesianPoint = { x: number; y: number };

export type OpeningHoursSectionProps = {
  openingHours: RestaurantOpeningHours;
};

export type RecommendationCardProps = {
  isRerolling: boolean;
  onBack: () => void;
  onMapsOpened: () => void;
  onReroll: () => void;
  result: RandomRecommendationResponse;
};

export type PhotoAttributionProps = {
  attribution: RestaurantPhotoAuthorAttribution;
};

export type CategoryPresentation = {
  icon?: string;
  label: string;
};
