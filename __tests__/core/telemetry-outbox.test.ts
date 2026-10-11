import { openDatabaseSync } from 'expo-sqlite';

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
  beforeAll(() => {
    jest.mocked(openDatabaseSync).mockReturnValue(mockDatabase as never);
  });

  beforeEach(() => jest.clearAllMocks());

  it('persists a fatal report and prunes the bounded queue synchronously', () => {
    persistPendingClientError(report);

    expect(mockDatabase.execSync).toHaveBeenCalledWith(
      expect.stringContaining('pending_client_error_reports'),
    );
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT OR REPLACE'),
      report.reportId,
      JSON.stringify(report),
      expect.any(Number),
    );
    expect(mockDatabase.runSync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('LIMIT -1 OFFSET ?'),
      10,
    );
  });

  it('returns stored reports and discards malformed rows', () => {
    mockDatabase.getAllSync.mockReturnValue([
      { reportId: report.reportId, payload: JSON.stringify(report) },
      { reportId: 'malformed', payload: '{' },
    ]);

    expect(getPendingClientErrors()).toEqual([report]);
    expect(mockDatabase.runSync).toHaveBeenCalledWith(
      'DELETE FROM pending_client_error_reports WHERE report_id = ?',
      'malformed',
    );
  });
});
