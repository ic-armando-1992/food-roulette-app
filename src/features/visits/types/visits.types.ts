import { VisitHistoryItem } from '@/api/contracts/visits';

export type CheckInVariables = {
  visitId: string;
  spinId: string;
  restaurantId: string;
};

export type CheckInLocationErrorKind = 'permission_denied' | 'unavailable';

export type CheckInCoordinates = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
};

export type VisitCardProps = { item: VisitHistoryItem };
