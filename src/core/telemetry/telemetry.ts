import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ApiError, apiRequest } from '@/api/client';
import {
  TELEMETRY_DEFAULTS,
  TELEMETRY_PATHS,
} from '@/core/telemetry/constants/telemetry.constants';
import {
  sanitizeClientErrorReport,
  sanitizeTelemetryText,
} from '@/core/telemetry/sanitize-telemetry-text';
import {
  getPendingClientErrors,
  persistPendingClientError,
  removePendingClientError,
} from '@/core/telemetry/telemetry-outbox';
import {
  ClientErrorReport,
  ClientErrorReportOptions,
  ClientErrorSource,
  ProductEventName,
  ProductEventProperties,
  TelemetryAcceptedResponse,
  TelemetryErrorProperties,
} from '@/core/telemetry/types/telemetry.types';

const appPlatform = Platform.OS === 'ios' ? 'ios' : 'android';
const appVersion = Constants.expoConfig?.version;

function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const sessionId = createUuid();

function sendBestEffort(path: string, body: unknown): void {
  void apiRequest<TelemetryAcceptedResponse>(path, {
    body,
    method: 'POST',
  }).catch(() => {
    // Telemetry must never interrupt the product flow or trigger user retries.
  });
}

function isPermanentClientError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.kind === 'http' &&
    error.status !== undefined &&
    error.status >= 400 &&
    error.status < 500 &&
    error.status !== 408 &&
    error.status !== 429
  );
}

export function createTelemetryId(): string {
  return createUuid();
}

export function trackProductEvent<Name extends ProductEventName>(
  eventName: Name,
  properties: ProductEventProperties[Name],
): void {
  sendBestEffort(TELEMETRY_PATHS.events, {
    eventId: createUuid(),
    sessionId,
    eventName,
    occurredAt: new Date().toISOString(),
    appPlatform,
    appVersion,
    properties,
  });
}

export function getTelemetryErrorProperties(
  error: unknown,
): TelemetryErrorProperties {
  if (error instanceof ApiError) {
    return {
      errorKind: error.kind,
      ...(error.status === undefined ? {} : { httpStatus: error.status }),
    };
  }

  return { errorKind: 'unexpected' };
}

export function sanitizeErrorText(value: string, maxLength: number): string {
  return sanitizeTelemetryText(value, maxLength);
}

function sendClientError(report: ClientErrorReport): void {
  void apiRequest<TelemetryAcceptedResponse>(TELEMETRY_PATHS.errors, {
    body: sanitizeClientErrorReport(report),
    method: 'POST',
  })
    .then(() => removePendingClientError(report.reportId))
    .catch(() => {
      // The durable outbox retries fatal JavaScript errors on the next launch.
    });
}

export async function flushPendingClientErrors(): Promise<void> {
  for (const report of getPendingClientErrors()) {
    try {
      await apiRequest<TelemetryAcceptedResponse>(TELEMETRY_PATHS.errors, {
        body: sanitizeClientErrorReport(report),
        method: 'POST',
      });
      removePendingClientError(report.reportId);
    } catch (error) {
      if (isPermanentClientError(error)) {
        removePendingClientError(report.reportId);
        continue;
      }

      break;
    }
  }
}

export function reportClientError(
  error: unknown,
  source: ClientErrorSource,
  options: ClientErrorReportOptions = {},
): void {
  const normalized = error instanceof Error ? error : new Error(String(error));

  const report = sanitizeClientErrorReport({
    reportId: createUuid(),
    sessionId,
    source,
    errorName: normalized.name || TELEMETRY_DEFAULTS.errorName,
    message: normalized.message || TELEMETRY_DEFAULTS.errorMessage,
    stack: normalized.stack,
    componentStack: options.componentStack ?? undefined,
    fatal: options.fatal ?? false,
    occurredAt: new Date().toISOString(),
    appPlatform,
    appVersion,
  });

  if (report.fatal) {
    persistPendingClientError(report);
    sendClientError(report);
    return;
  }

  sendBestEffort(TELEMETRY_PATHS.errors, report);
}
