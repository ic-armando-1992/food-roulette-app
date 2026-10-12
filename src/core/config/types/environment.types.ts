export type EnvironmentConfig = {
  apiBaseUrl: string | null;
  apiConfigurationError: string | null;
  telemetryErrorOutboxTtlDays: number;
};

export type PublicEnvironment = {
  EXPO_PUBLIC_API_BASE_URL?: string;
  EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS?: string;
};
