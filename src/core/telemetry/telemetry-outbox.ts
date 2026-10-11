import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';

import { TELEMETRY_OUTBOX } from '@/core/telemetry/constants/telemetry.constants';
import {
  ClientErrorReport,
  PendingClientErrorRow,
} from '@/core/telemetry/types/telemetry.types';

let database: SQLiteDatabase | undefined;

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
    outbox.runSync(
      `
        INSERT OR REPLACE INTO pending_client_error_reports (
          report_id,
          payload,
          created_at
        ) VALUES (?, ?, ?)
      `,
      report.reportId,
      JSON.stringify(report),
      Date.now(),
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
    return getDatabase()
      .getAllSync<PendingClientErrorRow>(
        `
          SELECT report_id AS "reportId", payload
          FROM pending_client_error_reports
          ORDER BY created_at
        `,
      )
      .flatMap((row) => {
        try {
          return [JSON.parse(row.payload) as ClientErrorReport];
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
