import { DEFAULT_API_TIMEOUT_MS } from '@/api/constants/client.constants';
import { ApiErrorKind, ApiRequestOptions } from '@/api/types/client.types';
import { getApiAccessToken, refreshApiAccessToken } from '@/api/auth';
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
  return executeApiRequest(path, options, false);
}

async function executeApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
  retriedAfterRefresh: boolean,
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
  const accessToken = options.auth === 'none' ? null : getApiAccessToken();

  try {
    const response = await fetch(url, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.body === undefined
          ? {}
          : { 'Content-Type': 'application/json' }),
      },
      method: options.method ?? 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      if (
        response.status === 401 &&
        accessToken &&
        !retriedAfterRefresh &&
        options.auth !== 'none'
      ) {
        const refreshedToken = await refreshApiAccessToken();

        if (refreshedToken) {
          return executeApiRequest(path, options, true);
        }
      }

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
