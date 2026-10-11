import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ApiError, apiRequest } from '@/api/client';
import {
  TELEMETRY_DEFAULTS,
  TELEMETRY_PATHS,
  TELEMETRY_REDACTION,
  TELEMETRY_TEXT_LIMITS,
} from '@/core/telemetry/constants/telemetry.constants';
import {
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
  return value
    .replace(
      TELEMETRY_REDACTION.coordinatePairPattern,
      '[redacted-coordinates]',
    )
    .replace(TELEMETRY_REDACTION.urlQueryPattern, '$1?[redacted]')
    .replace(TELEMETRY_REDACTION.secretPattern, '$1=[redacted]')
    .slice(0, maxLength);
}

export function reportClientError(
  error: unknown,
  source: ClientErrorSource,
  options: ClientErrorReportOptions = {},
): void {
  const normalized = error instanceof Error ? error : new Error(String(error));

  sendBestEffort(TELEMETRY_PATHS.errors, {
    reportId: createUuid(),
    sessionId,
    source,
    errorName: sanitizeErrorText(
      normalized.name || TELEMETRY_DEFAULTS.errorName,
      TELEMETRY_TEXT_LIMITS.errorName,
    ),
    message: sanitizeErrorText(
      normalized.message || TELEMETRY_DEFAULTS.errorMessage,
      TELEMETRY_TEXT_LIMITS.message,
    ),
    stack: normalized.stack
      ? sanitizeErrorText(normalized.stack, TELEMETRY_TEXT_LIMITS.stack)
      : undefined,
    componentStack: options.componentStack
      ? sanitizeErrorText(
          options.componentStack,
          TELEMETRY_TEXT_LIMITS.componentStack,
        )
      : undefined,
    fatal: options.fatal ?? false,
    occurredAt: new Date().toISOString(),
    appPlatform,
    appVersion,
  });
}
