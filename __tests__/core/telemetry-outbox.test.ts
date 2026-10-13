import { openDatabaseSync } from 'expo-sqlite';

import { env } from '@/core/config/env';
import {
  getPendingClientErrors,
  persistPendingClientError,
} from '@/core/telemetry/telemetry-outbox';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(),
}));

const mockDatabase = {
  execSync: jest.fn(),
  getAllSync: jest.fn(),
  runSync: jest.fn(),
};

const report = {
  reportId: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222',
  source: 'global' as const,
  errorName: 'Error',
  message: 'Sanitized failure',
  fatal: true,
  occurredAt: '2026-10-11T12:00:00.000Z',
  appPlatform: 'android' as const,
};

describe('telemetry outbox', () => {
  const now = Date.parse('2026-10-11T12:00:00.000Z');
  const originalTtlDays = env.telemetryErrorOutboxTtlDays;

  beforeAll(() => {
    jest.mocked(openDatabaseSync).mockReturnValue(mockDatabase as never);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    env.telemetryErrorOutboxTtlDays = 7;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    env.telemetryErrorOutboxTtlDays = originalTtlDays;
  });

  it('expires stale reports before inserting and prunes the bounded queue', () => {
    persistPendingClientError(report);

    expect(mockDatabase.execSync).toHaveBeenCalledWith(
      expect.stringContaining('pending_client_error_reports'),
    );
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM pending_client_error_reports WHERE created_at <= ?',
      now - 7 * 24 * 60 * 60 * 1_000,
    );
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT OR REPLACE'),
      report.reportId,
      JSON.stringify(report),
      now,
    );
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('LIMIT -1 OFFSET ?'),
      10,
    );
  });

  it('expires stale reports while reading and discards malformed rows', () => {
    mockDatabase.getAllSync.mockReturnValue([
      { reportId: report.reportId, payload: JSON.stringify(report) },
      { reportId: 'malformed', payload: '{' },
    ]);

    expect(getPendingClientErrors()).toEqual([report]);
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      1,
      'DELETE FROM pending_client_error_reports WHERE created_at <= ?',
      now - 7 * 24 * 60 * 60 * 1_000,
    );
    expect(mockDatabase.getAllSync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at'),
    );
    expect(mockDatabase.runSync).toHaveBeenCalledWith(
      'DELETE FROM pending_client_error_reports WHERE report_id = ?',
      'malformed',
    );
  });

  it('re-sanitizes legacy rows before they can leave the device', () => {
    const legacyReport = {
      ...report,
      message: 'Authorization: Digest username="private user", secret=value',
    };
    mockDatabase.getAllSync.mockReturnValue([
      {
        reportId: legacyReport.reportId,
        payload: JSON.stringify(legacyReport),
      },
    ]);

    expect(getPendingClientErrors()).toEqual([
      { ...legacyReport, message: 'Authorization: [redacted]' },
    ]);
    expect(mockDatabase.runSync).toHaveBeenCalledWith(
      'UPDATE pending_client_error_reports SET payload = ? WHERE report_id = ?',
      JSON.stringify({
        ...legacyReport,
        message: 'Authorization: [redacted]',
      }),
      legacyReport.reportId,
    );
  });
});
