import { apiRequest } from '@/api/client';
import { env } from '@/core/config/env';

describe('apiRequest', () => {
  const originalApiBaseUrl = env.apiBaseUrl;

  beforeEach(() => {
    env.apiBaseUrl = 'https://api.example.test';
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
