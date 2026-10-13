import {
  TELEMETRY_REDACTION,
  TELEMETRY_REDACTION_TEXT,
  TELEMETRY_TEXT_LIMITS,
} from '@/core/telemetry/constants/telemetry.constants';
import { ClientErrorReport } from '@/core/telemetry/types/telemetry.types';

function findQuotedEnd(value: string, start: number, quote: string): number {
  let end = start + 1;
  while (end < value.length) {
    if (value[end] === '\\') {
      end += 2;
    } else if (value[end] === quote) {
      return end;
    } else {
      end += 1;
    }
  }
  return value.length;
}

function findHeaderEnd(value: string, start: number): number {
  let end = start;

  while (end < value.length) {
    while (end < value.length && value[end] !== '\r' && value[end] !== '\n') {
      end += 1;
    }

    const nextLine =
      value[end] === '\r' && value[end + 1] === '\n' ? end + 2 : end + 1;
    if (value[nextLine] !== ' ' && value[nextLine] !== '\t') {
      break;
    }
    end = nextLine;
  }

  return end;
}

function findValueEnd(
  value: string,
  start: number,
  separator: string,
  wholeHeader: boolean,
): number {
  if (wholeHeader) {
    return findHeaderEnd(value, start);
  }

  const quote = value[start];
  if (quote === '"' || quote === "'") {
    return findQuotedEnd(value, start, quote);
  }

  if (separator === ':') {
    return findHeaderEnd(value, start);
  }

  let end = value.startsWith(TELEMETRY_REDACTION_TEXT.secret, start)
    ? start + TELEMETRY_REDACTION_TEXT.secret.length
    : start;
  while (end < value.length && !/[\s,;}\]]/.test(value[end] ?? '')) {
    end += 1;
  }
  return end;
}

function redactAssignments(value: string): string {
  const pattern = TELEMETRY_REDACTION.sensitiveAssignmentPattern;
  const chunks: string[] = [];
  let copiedUntil = 0;
  let match: RegExpExecArray | null;

  pattern.lastIndex = 0;
  while ((match = pattern.exec(value)) !== null) {
    const valueStart = pattern.lastIndex;
    const key = match[3].toLowerCase().replace(/[-_]/g, '');
    const quote = value[valueStart];
    const wholeHeader = key === 'authorization' && match[2] === '';
    const quotedValue = quote === '"' || quote === "'";
    const redactionStart =
      quotedValue && !wholeHeader ? valueStart + 1 : valueStart;

    const valueEnd = findValueEnd(value, valueStart, match[4], wholeHeader);
    if (valueEnd <= redactionStart) {
      continue;
    }

    chunks.push(
      value.slice(copiedUntil, redactionStart),
      TELEMETRY_REDACTION_TEXT.secret,
    );
    copiedUntil = valueEnd;
    pattern.lastIndex = valueEnd;
  }
  pattern.lastIndex = 0;

  chunks.push(value.slice(copiedUntil));
  return chunks.join('');
}

export function sanitizeTelemetryText(
  value: string,
  maxLength: number,
): string {
  return redactAssignments(value)
    .replace(
      TELEMETRY_REDACTION.bearerCredentialPattern,
      `$1${TELEMETRY_REDACTION_TEXT.secret}`,
    )
    .replace(
      TELEMETRY_REDACTION.coordinatePairPattern,
      TELEMETRY_REDACTION_TEXT.coordinates,
    )
    .replace(
      TELEMETRY_REDACTION.labeledCoordinatePattern,
      `$1${TELEMETRY_REDACTION_TEXT.coordinates}`,
    )
    .replace(
      TELEMETRY_REDACTION.urlQueryPattern,
      `$1?${TELEMETRY_REDACTION_TEXT.secret}`,
    )
    .slice(0, maxLength);
}

export function sanitizeClientErrorReport(
  report: ClientErrorReport,
): ClientErrorReport {
  return {
    ...report,
    errorName: sanitizeTelemetryText(
      report.errorName,
      TELEMETRY_TEXT_LIMITS.errorName,
    ),
    message: sanitizeTelemetryText(
      report.message,
      TELEMETRY_TEXT_LIMITS.message,
    ),
    stack: report.stack
      ? sanitizeTelemetryText(report.stack, TELEMETRY_TEXT_LIMITS.stack)
      : undefined,
    componentStack: report.componentStack
      ? sanitizeTelemetryText(
          report.componentStack,
          TELEMETRY_TEXT_LIMITS.componentStack,
        )
      : undefined,
  };
}
