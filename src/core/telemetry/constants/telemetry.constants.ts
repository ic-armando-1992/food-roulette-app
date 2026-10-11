export const TELEMETRY_EVENTS = {
  appOpened: 'app_opened',
  locationDenied: 'location_denied',
  locationGranted: 'location_granted',
  mapsOpened: 'restaurant_maps_opened',
  spinAgain: 'roulette_spin_again',
  spinFailed: 'roulette_spin_failed',
  spinResult: 'roulette_spin_result',
  spinStarted: 'roulette_spin_started',
} as const;

export const TELEMETRY_PATHS = {
  errors: '/v1/telemetry/errors',
  events: '/v1/telemetry/events',
} as const;

export const TELEMETRY_DEFAULTS = {
  errorMessage: 'Unknown error',
  errorName: 'Error',
} as const;

export const TELEMETRY_TEXT_LIMITS = {
  componentStack: 8_000,
  errorName: 100,
  message: 500,
  stack: 8_000,
} as const;

export const TELEMETRY_REDACTION = {
  coordinatePairPattern: /-?\d{1,3}\.\d{4,}\s*[,;]\s*-?\d{1,3}\.\d{4,}/g,
  secretPattern:
    /\b(api[_-]?key|authorization|bearer|password|secret|token)\b\s*[:=]\s*[^\s,;]+/gi,
  urlQueryPattern: /(https?:\/\/[^\s?]+)\?[^\s)]+/g,
} as const;
