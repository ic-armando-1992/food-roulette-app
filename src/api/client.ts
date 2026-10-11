import { DEFAULT_API_TIMEOUT_MS } from '@/api/constants/client.constants';
import { ApiErrorKind, ApiRequestOptions } from '@/api/types/client.types';
import { env } from '@/core/config/env';

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status?: number,
  ) {
    super(kind);
    this.name = 'ApiError';
  }
}

export function getApiResourceUrl(path: string): string | null {
  if (!env.apiBaseUrl) {
    return null;
  }

  return `${env.apiBaseUrl}/${path.replace(/^\/+/, '')}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = getApiResourceUrl(path);

  if (!url) {
    throw new ApiError('configuration');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_API_TIMEOUT_MS,
  );
  const abortRequest = () => controller.abort();
  options.signal?.addEventListener('abort', abortRequest, { once: true });

  try {
    const response = await fetch(url, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
      },
      method: options.method ?? 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError('http', response.status);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError('invalid-response', response.status);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw new ApiError(options.signal?.aborted ? 'network' : 'timeout');
    }

    throw new ApiError('network');
  } finally {
    clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', abortRequest);
  }
}
