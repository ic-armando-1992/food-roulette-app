import {
  EnvironmentConfig,
  PublicEnvironment,
} from '@/core/config/types/environment.types';
import {
  APP_CONFIG_DEFAULTS,
  APP_CONFIG_LIMITS,
  APP_ERROR_MESSAGES,
} from '@/core/constants/app.constants';

function readApiBaseUrl(
  value: string | undefined,
): Pick<EnvironmentConfig, 'apiBaseUrl' | 'apiConfigurationError'> {
  const candidate = value?.trim().replace(/\/+$/, '');

  if (!candidate) {
    return {
      apiBaseUrl: null,
      apiConfigurationError: APP_ERROR_MESSAGES.missingApiUrl,
    };
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error(APP_ERROR_MESSAGES.unsupportedApiProtocol);
    }

    return {
      apiBaseUrl: url.toString().replace(/\/+$/, ''),
      apiConfigurationError: null,
    };
  } catch {
    return {
      apiBaseUrl: null,
      apiConfigurationError: APP_ERROR_MESSAGES.invalidApiUrl,
    };
  }
}

function readTelemetryErrorOutboxTtlDays(value: string | undefined): number {
  const candidate = Number(value);
  const { maximum, minimum } = APP_CONFIG_LIMITS.telemetryErrorOutboxTtlDays;

  return Number.isInteger(candidate) &&
    candidate >= minimum &&
    candidate <= maximum
    ? candidate
    : APP_CONFIG_DEFAULTS.telemetryErrorOutboxTtlDays;
}

export function readEnvironment(values: PublicEnvironment): EnvironmentConfig {
  return {
    ...readApiBaseUrl(values.EXPO_PUBLIC_API_BASE_URL),
    telemetryErrorOutboxTtlDays: readTelemetryErrorOutboxTtlDays(
      values.EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS,
    ),
  };
}

export const env = readEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS:
    process.env.EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS,
});
