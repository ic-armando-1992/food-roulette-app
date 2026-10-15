import { apiRequest } from '@/api/client';
import { configureApiTokenRefresh, setApiAccessToken } from '@/api/auth';
import { env } from '@/core/config/env';

describe('apiRequest', () => {
  const originalApiBaseUrl = env.apiBaseUrl;

  beforeEach(() => {
    env.apiBaseUrl = 'https://api.example.test';
    setApiAccessToken(null);
    configureApiTokenRefresh(async () => null);
  });

  afterEach(() => {
    jest.useRealTimers();
    env.apiBaseUrl = originalApiBaseUrl;
    jest.restoreAllMocks();
  });

  it('returns a parsed successful response', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    await expect(apiRequest<{ ok: boolean }>('/health')).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('normalizes a network failure', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
    await expect(
      apiRequest('/v1/recommendations/random'),
    ).rejects.toMatchObject({ kind: 'network' });
  });

  it('normalizes an HTTP failure without exposing its response body', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response('provider data', { status: 503 }));
    await expect(
      apiRequest('/v1/recommendations/random'),
    ).rejects.toMatchObject({ kind: 'http', status: 503 });
  });

  it('exposes only the allowlisted Google conflict contract', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'GOOGLE_IDENTITY_CONFLICT',
          confirmationToken: 'A'.repeat(43),
          message: 'server text that UI must not consume',
          internalDetail: 'hidden',
        }),
        { status: 409 },
      ),
    );

    await expect(apiRequest('/v1/auth/google')).rejects.toMatchObject({
      kind: 'http',
      status: 409,
      code: 'GOOGLE_IDENTITY_CONFLICT',
      confirmationToken: 'A'.repeat(43),
      message: 'http',
    });
  });

  it('does not expose malformed conflict bodies', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'GOOGLE_IDENTITY_CONFLICT',
          confirmationToken: 'manipulated',
          internalDetail: 'hidden',
        }),
        { status: 409 },
      ),
    );

    await expect(apiRequest('/v1/auth/google')).rejects.toMatchObject({
      kind: 'http',
      status: 409,
      code: undefined,
      confirmationToken: undefined,
      message: 'http',
    });
  });

  it('attaches the access token centrally', async () => {
    setApiAccessToken('access-token');
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true })));

    await apiRequest('/v1/auth/me');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/v1/auth/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      }),
    );
  });

  it('coordinates one refresh and retries a rejected authenticated request once', async () => {
    setApiAccessToken('expired-token');
    const refresh = jest.fn(async () => {
      setApiAccessToken('refreshed-token');
      return 'refreshed-token';
    });
    configureApiTokenRefresh(refresh);
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true })));

    await expect(apiRequest<{ ok: boolean }>('/protected')).resolves.toEqual({
      ok: true,
    });

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://api.example.test/protected',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer refreshed-token',
        }),
      }),
    );
  });

  it('aborts and normalizes a slow request as a timeout', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject(new Error('aborted'));
        });
      });
    });
    const request = apiRequest('/slow', { timeoutMs: 50 });
    const rejection = expect(request).rejects.toMatchObject({
      kind: 'timeout',
    });

    await jest.advanceTimersByTimeAsync(50);
    await rejection;
  });
});
