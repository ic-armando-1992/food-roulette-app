import { apiRequest } from '@/api/client';
import {
  getTelemetryErrorProperties,
  reportClientError,
  sanitizeErrorText,
  trackProductEvent,
} from '@/core/telemetry/telemetry';

jest.mock('@/api/client', () => {
  class MockApiError extends Error {
    readonly kind: string;
    readonly status?: number;

    constructor(mockKind: string, mockStatus?: number) {
      super(mockKind);
      this.kind = mockKind;
      this.status = mockStatus;
    }
  }

  return {
    ApiError: MockApiError,
    apiRequest: jest.fn().mockResolvedValue({ accepted: true }),
  };
});

const mockApiRequest = jest.mocked(apiRequest);

describe('telemetry', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends an event envelope without location data', () => {
    trackProductEvent('roulette_spin_started', {
      spinId: '33333333-3333-4333-8333-333333333333',
      reroll: false,
      radiusMeters: 3_000,
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      '/v1/telemetry/events',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          eventName: 'roulette_spin_started',
          properties: {
            spinId: '33333333-3333-4333-8333-333333333333',
            reroll: false,
            radiusMeters: 3_000,
          },
        }),
      }),
    );
    expect(JSON.stringify(mockApiRequest.mock.calls[0])).not.toContain(
      'latitude',
    );
  });

  it('redacts coordinates, URL queries and secrets from errors', () => {
    expect(
      sanitizeErrorText(
        'At 32.5149,-117.0382 https://test/path?token=x token=secret',
        500,
      ),
    ).toBe(
      'At [redacted-coordinates] https://test/path?[redacted] token=[redacted]',
    );
  });

  it('reports sanitized errors through the API boundary', () => {
    reportClientError(
      new Error('Failure at 32.5149,-117.0382 token=secret'),
      'global',
      { fatal: true },
    );

    expect(mockApiRequest).toHaveBeenCalledWith(
      '/v1/telemetry/errors',
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          fatal: true,
          message: 'Failure at [redacted-coordinates] token=[redacted]',
          source: 'global',
        }),
      }),
    );
  });

  it('normalizes unknown errors without copying their message', () => {
    expect(getTelemetryErrorProperties(new Error('private detail'))).toEqual({
      errorKind: 'unexpected',
    });
  });
});
