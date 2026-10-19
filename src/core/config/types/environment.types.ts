export type EnvironmentConfig = {
  apiBaseUrl: string | null;
  apiConfigurationError: string | null;
  googleIosClientId: string | null;
  googleWebClientId: string | null;
  telemetryErrorOutboxTtlDays: number;
};
