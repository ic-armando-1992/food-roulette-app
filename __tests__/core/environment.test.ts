import { readEnvironment } from '@/core/config/env';

describe('readEnvironment', () => {
  it('uses a configured telemetry outbox TTL within API retention', () => {
    expect(
      readEnvironment({
        EXPO_PUBLIC_API_BASE_URL: 'https://api.example.test',
        EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS: '14',
      }).telemetryErrorOutboxTtlDays,
    ).toBe(14);
  });

  it.each(['0', '31', '1.5', 'not-a-number'])(
    'falls back to seven days for invalid TTL %s',
    (value) => {
      expect(
        readEnvironment({
          EXPO_PUBLIC_TELEMETRY_ERROR_OUTBOX_TTL_DAYS: value,
        }).telemetryErrorOutboxTtlDays,
      ).toBe(7);
    },
  );

  it('accepts only well-formed public Google OAuth client identifiers', () => {
    expect(
      readEnvironment({
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
          '123-example.apps.googleusercontent.com',
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: 'not-a-client-id',
      }),
    ).toEqual(
      expect.objectContaining({
        googleWebClientId: '123-example.apps.googleusercontent.com',
        googleIosClientId: null,
      }),
    );
  });
});
