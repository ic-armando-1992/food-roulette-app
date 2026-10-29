import { FavoriteRestaurant } from '@/api/contracts/favorites';
import { XpOperationResult } from '@/api/contracts/achievements';

export type CheckInRequest = {
  visitId: string;
  spinId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  observedAt: string;
};

export type VerifiedVisit = {
  id: string;
  restaurantId: string;
  spinId: string;
  checkedInAt: string;
  verificationDistanceMeters: number;
  locationAccuracyMeters: number;
  source: 'roulette';
};

export type CheckInResponse =
  | {
      status: 'verified';
      visit: VerifiedVisit;
      progressionUpdate?: XpOperationResult;
    }
  | {
      status: 'too_far';
      distanceMeters: number;
      allowedDistanceMeters: number;
    }
  | {
      status: 'accuracy_too_low';
      accuracyMeters: number;
      maximumAccuracyMeters: number;
    }
  | {
      status: 'location_too_old';
      maximumAgeSeconds: number;
    };

export type VisitHistoryItem = {
  id: string;
  restaurantId: string;
  spinId: string;
  checkedInAt: string;
  verificationDistanceMeters: number;
  source: 'roulette';
  restaurant: FavoriteRestaurant | null;
  attribution: {
    provider: string;
    displayText: string;
  } | null;
};

export type VisitHistoryResponse = { visits: VisitHistoryItem[] };
