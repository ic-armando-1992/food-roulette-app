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
    source: string;
  };
  roulette_spin_failed: {
    spinId: string;
    reroll: boolean;
    radiusMeters: number;
    durationMs: number;
    errorKind: string;
    httpStatus?: number;
  };
  roulette_spin_again: { restaurantId: string };
  restaurant_maps_opened: { restaurantId: string; spinId: string };
};

export type ProductEventName = keyof ProductEventProperties;
export type ClientErrorSource = 'global' | 'react_error_boundary';
export type TelemetryAcceptedResponse = { accepted: true };

export type ClientErrorReportOptions = {
  componentStack?: string | null;
  fatal?: boolean;
};

export type TelemetryErrorProperties = {
  errorKind: string;
  httpStatus?: number;
};

export type GlobalErrorHandler = (error: Error, isFatal?: boolean) => void;

export type ErrorUtilsApi = {
  getGlobalHandler?: () => GlobalErrorHandler;
  setGlobalHandler?: (handler: GlobalErrorHandler) => void;
};

export type AppErrorBoundaryState = { hasError: boolean };
