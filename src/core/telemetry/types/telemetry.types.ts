import {
  TELEMETRY_ERROR_KINDS,
  TELEMETRY_RECOMMENDATION_SOURCES,
} from '@/core/telemetry/constants/telemetry.constants';

export type TelemetryErrorKind = (typeof TELEMETRY_ERROR_KINDS)[number];
export type TelemetryRecommendationSource =
  (typeof TELEMETRY_RECOMMENDATION_SOURCES)[number];

export type ProductEventProperties = {
  app_opened: Record<string, never>;
  location_granted: Record<string, never>;
  location_denied: Record<string, never>;
  roulette_spin_started: {
    spinId: string;
    reroll: boolean;
    radiusMeters: number;
  };
  roulette_spin_result: {
    spinId: string;
    reroll: boolean;
    radiusMeters: number;
    durationMs: number;
    restaurantId: string;
    source: TelemetryRecommendationSource;
  };
  roulette_spin_failed: {
    spinId: string;
    reroll: boolean;
    radiusMeters: number;
    durationMs: number;
    errorKind: TelemetryErrorKind;
    httpStatus?: number;
  };
  roulette_spin_again: { restaurantId: string };
  restaurant_maps_opened: { restaurantId: string; spinId: string };
  restaurant_favorited: { restaurantId: string };
  restaurant_checked_in: {
    restaurantId: string;
    visitId: string;
    verificationDistanceMeters: number;
  };
};

export type ProductEventName = keyof ProductEventProperties;
export type ClientErrorSource = 'global' | 'react_error_boundary';
export type TelemetryAcceptedResponse = { accepted: true };

export type ClientErrorReportOptions = {
  componentStack?: string | null;
  fatal?: boolean;
};

export type TelemetryErrorProperties = {
  errorKind: TelemetryErrorKind;
  httpStatus?: number;
};

export type ClientErrorReport = {
  reportId: string;
  sessionId: string;
  source: ClientErrorSource;
  errorName: string;
  message: string;
  stack?: string;
  componentStack?: string;
  fatal: boolean;
  occurredAt: string;
  appPlatform: 'android' | 'ios';
  appVersion?: string;
};

export type PendingClientErrorRow = {
  reportId: string;
  payload: string;
};

export type GlobalErrorHandler = (error: Error, isFatal?: boolean) => void;

export type ErrorUtilsApi = {
  getGlobalHandler?: () => GlobalErrorHandler;
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
};

export type AppErrorBoundaryState = { hasError: boolean };
