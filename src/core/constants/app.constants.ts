export const APP_ERROR_MESSAGES = {
  invalidApiUrl: 'EXPO_PUBLIC_API_BASE_URL must be a valid HTTP(S) URL.',
  missingApiUrl: 'EXPO_PUBLIC_API_BASE_URL is not configured.',
  unsupportedApiProtocol: 'Unsupported API URL protocol.',
} as const;

export const APP_CONFIG_DEFAULTS = {
  telemetryErrorOutboxTtlDays: 7,
} as const;

export const APP_CONFIG_LIMITS = {
  telemetryErrorOutboxTtlDays: {
    maximum: 30,
    minimum: 1,
  },
} as const;
