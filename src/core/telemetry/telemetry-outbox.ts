import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

import { env } from '@/core/config/env';
import { TELEMETRY_OUTBOX } from '@/core/telemetry/constants/telemetry.constants';
import { sanitizeClientErrorReport } from '@/core/telemetry/sanitize-telemetry-text';
import {
  ClientErrorReport,
  PendingClientErrorRow,
} from '@/core/telemetry/types/telemetry.types';

let database: SQLiteDatabase | undefined;

function getExpirationCutoff(now: number): number {
  return (
    now - env.telemetryErrorOutboxTtlDays * TELEMETRY_OUTBOX.millisecondsPerDay
  );
}

function deleteExpiredReports(outbox: SQLiteDatabase, now: number): void {
  outbox.runSync(
    'DELETE FROM pending_client_error_reports WHERE created_at <= ?',
    getExpirationCutoff(now),
  );
}

function getDatabase(): SQLiteDatabase {
  if (!database) {
    database = openDatabaseSync(TELEMETRY_OUTBOX.databaseName);
    database.execSync(`
      CREATE TABLE IF NOT EXISTS pending_client_error_reports (
        report_id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  return database;
}

export function persistPendingClientError(report: ClientErrorReport): void {
  try {
    const outbox = getDatabase();
    const now = Date.now();
    const sanitizedReport = sanitizeClientErrorReport(report);
    deleteExpiredReports(outbox, now);
    outbox.runSync(
      `
        INSERT OR REPLACE INTO pending_client_error_reports (
          report_id,
          payload,
          created_at
        ) VALUES (?, ?, ?)
      `,
      sanitizedReport.reportId,
      JSON.stringify(sanitizedReport),
      now,
    );
    outbox.runSync(
      `
        DELETE FROM pending_client_error_reports
        WHERE report_id IN (
          SELECT report_id
          FROM pending_client_error_reports
          ORDER BY created_at DESC
          LIMIT -1 OFFSET ?
        )
      `,
      TELEMETRY_OUTBOX.maximumPendingReports,
    );
  } catch {
    // Error reporting must never replace the original application failure.
  }
}

export function getPendingClientErrors(): ClientErrorReport[] {
  try {
    const outbox = getDatabase();
    const now = Date.now();
    const expirationCutoff = getExpirationCutoff(now);
    deleteExpiredReports(outbox, now);

    return outbox
      .getAllSync<PendingClientErrorRow>(
        `
          SELECT report_id AS "reportId", payload
          FROM pending_client_error_reports
          WHERE created_at > ?
          ORDER BY created_at
        `,
        expirationCutoff,
      )
      .flatMap((row) => {
        try {
          const report = sanitizeClientErrorReport(
            JSON.parse(row.payload) as ClientErrorReport,
          );
          const sanitizedPayload = JSON.stringify(report);
          if (sanitizedPayload !== row.payload) {
            outbox.runSync(
              'UPDATE pending_client_error_reports SET payload = ? WHERE report_id = ?',
              sanitizedPayload,
              row.reportId,
            );
          }
          return [report];
        } catch {
          removePendingClientError(row.reportId);
          return [];
        }
      });
  } catch {
    return [];
  }
}

export function removePendingClientError(reportId: string): void {
  try {
    getDatabase().runSync(
      'DELETE FROM pending_client_error_reports WHERE report_id = ?',
      reportId,
    );
  } catch {
    // A later launch can retry cleanup without affecting the product flow.
  }
}
