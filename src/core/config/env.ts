type EnvironmentConfig = {
  apiBaseUrl: string | null;
  apiConfigurationError: string | null;
};

function readApiBaseUrl(value: string | undefined): EnvironmentConfig {
  const candidate = value?.trim().replace(/\/+$/, '');

  if (!candidate) {
    return {
      apiBaseUrl: null,
      apiConfigurationError: 'EXPO_PUBLIC_API_BASE_URL is not configured.',
    };
  }

  try {
    const url = new URL(candidate);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Unsupported API URL protocol.');
    }

    return {
      apiBaseUrl: url.toString().replace(/\/+$/, ''),
      apiConfigurationError: null,
    };
  } catch {
    return {
      apiBaseUrl: null,
      apiConfigurationError:
        'EXPO_PUBLIC_API_BASE_URL must be a valid HTTP(S) URL.',
    };
  }
}

export const env = readApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
