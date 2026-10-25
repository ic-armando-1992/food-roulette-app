import {
  RandomRecommendationResponse,
  RestaurantOpeningHours,
  RestaurantPhotoAuthorAttribution,
} from '@/api/contracts/recommendations';
import { CheckInResponse } from '@/api/contracts/visits';

export type DiscoveryView = 'home' | 'result';

export type BrandHeaderProps = {
  actionsDisabled?: boolean;
  onAccountPress: () => void;
  onFavoritesPress?: () => void;
  onVisitsPress?: () => void;
  showFavorites?: boolean;
  showVisits?: boolean;
  showSettings?: boolean;
};
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

export type RouletteSpinPhase = 'idle' | 'spinning' | 'stopping';

export type RouletteSpinnerProps = {
  disabled?: boolean;
  onSpinRequest?: () => void;
  onStopped?: () => void;
  phase?: RouletteSpinPhase;
};

export type RouletteLoadingStateProps = {
  onSpinStopped: () => void;
  spinPhase: Exclude<RouletteSpinPhase, 'idle'>;
};

export type CartesianPoint = { x: number; y: number };

export type OpeningHoursSectionProps = {
  openingHours: RestaurantOpeningHours;
};

export type RecommendationCardProps = {
  checkInResult: CheckInResponse | null;
  favoriteDisabled: boolean;
  isFavorite: boolean;
  isFavoritePending: boolean;
  isRerolling: boolean;
  isCheckInPending: boolean;
  onBack: () => void;
  onCheckIn: () => void;
  onFavoriteToggle: () => void;
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
