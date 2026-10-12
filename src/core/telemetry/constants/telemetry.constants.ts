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

export const TELEMETRY_ERROR_KINDS = [
  'configuration',
  'http',
  'invalid-response',
  'network',
  'timeout',
  'unexpected',
] as const;

export const TELEMETRY_RECOMMENDATION_SOURCES = [
  'catalog',
  'provider',
] as const;

export const TELEMETRY_TEXT_LIMITS = {
  componentStack: 8_000,
  errorName: 100,
  message: 500,
  stack: 8_000,
} as const;

export const TELEMETRY_REDACTION = {
  coordinatePairPattern: /[+-]?\d{1,3}\.\d{4,}\s*[,;]\s*[+-]?\d{1,3}\.\d{4,}/g,
  labeledCoordinatePattern:
    /((?:"|')?\b(?:lat(?:itude)?|lon(?:gitude)?|lng)\b(?:"|')?\s*[:=]\s*)[+-]?\d{1,3}(?:\.\d+)?/gi,
  urlQueryPattern: /(https?:\/\/[^\s?]+)\?[^\s)]+/g,
} as const;

export const TELEMETRY_REDACTION_TEXT = {
  coordinates: '[redacted-coordinates]',
  secret: '[redacted]',
} as const;

export const TELEMETRY_SENSITIVE_KEYS = new Set([
  'apikey',
  'authorization',
  'accesstoken',
  'clientsecret',
  'idtoken',
  'password',
  'privatekey',
  'refreshtoken',
  'secret',
  'sessiontoken',
  'token',
]);

export const TELEMETRY_OUTBOX = {
  databaseName: 'telemetry.db',
  millisecondsPerDay: 24 * 60 * 60 * 1_000,
  maximumPendingReports: 10,
} as const;
