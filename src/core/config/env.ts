import { EnvironmentConfig } from '@/core/config/types/environment.types';
import { APP_CONFIG, APP_ERROR_MESSAGES } from '@/core/constants/app.constants';

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

export function readEnvironment(
  values: Record<string, string | undefined>,
): EnvironmentConfig {
  const ttl = Number(values.EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS);
  const ttlConfig = APP_CONFIG.errorOutboxTtlDays;

  return {
    ...readApiBaseUrl(values.EXPO_PUBLIC_API_BASE_URL),
    googleIosClientId: readGoogleClientId(
      values.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    ),
    googleWebClientId: readGoogleClientId(
      values.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    ),
    telemetryErrorOutboxTtlDays:
      Number.isInteger(ttl) &&
      ttl >= ttlConfig.minimum &&
      ttl <= ttlConfig.maximum
        ? ttl
        : ttlConfig.defaultValue,
  };
}

function readGoogleClientId(value: string | undefined): string | null {
  const clientId = value?.trim();

  return clientId &&
    /^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/.test(clientId)
    ? clientId
    : null;
}

export const env = readEnvironment({
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS:
    process.env.EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS,
});
