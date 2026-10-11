import { apiRequest } from '@/api/client';
import {
  getPendingClientErrors,
  persistPendingClientError,
  removePendingClientError,
} from '@/core/telemetry/telemetry-outbox';
import {
  flushPendingClientErrors,
  getTelemetryErrorProperties,
  reportClientError,
  sanitizeErrorText,
  trackProductEvent,
} from '@/core/telemetry/telemetry';

jest.mock('@/core/telemetry/telemetry-outbox', () => ({
  getPendingClientErrors: jest.fn(),
  persistPendingClientError: jest.fn(),
  removePendingClientError: jest.fn(),
}));

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
const mockGetPendingClientErrors = jest.mocked(getPendingClientErrors);
const mockPersistPendingClientError = jest.mocked(persistPendingClientError);
const mockRemovePendingClientError = jest.mocked(removePendingClientError);

describe('telemetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue({ accepted: true });
    mockGetPendingClientErrors.mockReturnValue([]);
  });

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

  it('redacts JSON secrets, bearer credentials and labeled coordinates', () => {
    expect(
      sanitizeErrorText(
        'Authorization: Bearer topsecret {"token":"jsonsecret","latitude":32.5149,"longitude":-117.0382}',
        500,
      ),
    ).toBe(
      'Authorization: [redacted] {"token":"[redacted]","latitude":[redacted-coordinates],"longitude":[redacted-coordinates]}',
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
    expect(mockPersistPendingClientError).toHaveBeenCalledWith(
      expect.objectContaining({
        fatal: true,
        message: 'Failure at [redacted-coordinates] token=[redacted]',
      }),
    );
  });

  it('retries durable fatal reports and removes them after delivery', async () => {
    const pendingReport = {
      reportId: '11111111-1111-4111-8111-111111111111',
      sessionId: '22222222-2222-4222-8222-222222222222',
      source: 'global' as const,
      errorName: 'Error',
      message: 'Sanitized failure',
      fatal: true,
      occurredAt: '2026-10-11T12:00:00.000Z',
      appPlatform: 'android' as const,
    };
    mockGetPendingClientErrors.mockReturnValue([pendingReport]);

    await flushPendingClientErrors();

    expect(mockApiRequest).toHaveBeenCalledWith('/v1/telemetry/errors', {
      body: pendingReport,
      method: 'POST',
    });
    expect(mockRemovePendingClientError).toHaveBeenCalledWith(
      pendingReport.reportId,
    );
  });

  it('normalizes unknown errors without copying their message', () => {
    expect(getTelemetryErrorProperties(new Error('private detail'))).toEqual({
      errorKind: 'unexpected',
    });
  });
});
