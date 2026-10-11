import { EnvironmentConfig } from '@/core/config/types/environment.types';
import { APP_ERROR_MESSAGES } from '@/core/constants/app.constants';

function readApiBaseUrl(value: string | undefined): EnvironmentConfig {
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

export const env = readApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
