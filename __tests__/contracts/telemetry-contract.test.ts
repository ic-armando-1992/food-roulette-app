import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { apiRequest } from '@/api/client';
import { buildRecommendation } from '../../test-support/recommendation.fixture';
import { trackProductEvent } from '@/core/telemetry/telemetry';
import {
  ProductEventName,
  ProductEventProperties,
} from '@/core/telemetry/types/telemetry.types';

jest.mock('@/api/client', () => ({
  ApiError: class MockApiError extends Error {},
  apiRequest: jest.fn().mockResolvedValue({ accepted: true }),
}));

type TelemetryContractEvent = {
  eventName: ProductEventName;
  properties: ProductEventProperties[ProductEventName];
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const contractEvents = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'test-contracts/telemetry-events.json'),
    'utf8',
  ),
) as TelemetryContractEvent[];
const mockApiRequest = jest.mocked(apiRequest);

describe('app/API telemetry contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockResolvedValue({ accepted: true });
  });

  it('emits every shared event payload in the API envelope', () => {
    for (const event of contractEvents) {
      trackProductEvent(event.eventName, event.properties as never);
    }

    expect(mockApiRequest).toHaveBeenCalledTimes(contractEvents.length);
    contractEvents.forEach((event, index) => {
      const [path, options] = mockApiRequest.mock.calls[index];
      const body = options?.body as Record<string, unknown>;

      expect(path).toBe('/v1/telemetry/events');
      expect(options?.method).toBe('POST');
      expect(body.eventName).toBe(event.eventName);
      expect(body.properties).toEqual(event.properties);
      expect(body.eventId).toEqual(expect.stringMatching(uuidPattern));
      expect(body.sessionId).toEqual(expect.stringMatching(uuidPattern));
      expect(Date.parse(body.occurredAt as string)).not.toBeNaN();
      expect(['android', 'ios']).toContain(body.appPlatform);
    });
  });

  it('uses UUID identifiers in recommendation fixtures sent to production code', () => {
    const fixture = buildRecommendation();

    expect(fixture.recommendation.id).toMatch(uuidPattern);
    expect(fixture.candidatePool.id).toMatch(uuidPattern);
  });
});
