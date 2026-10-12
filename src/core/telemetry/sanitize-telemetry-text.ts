import {
  TELEMETRY_REDACTION,
  TELEMETRY_REDACTION_TEXT,
  TELEMETRY_SENSITIVE_KEYS,
  TELEMETRY_TEXT_LIMITS,
} from '@/core/telemetry/constants/telemetry.constants';
import {
  ClientErrorReport,
  TelemetryRedactionSpan,
} from '@/core/telemetry/types/telemetry.types';

function isIdentifierCharacter(character: string | undefined): boolean {
  return character !== undefined && /[A-Za-z0-9_-]/.test(character);
}

function skipHorizontalWhitespace(value: string, start: number): number {
  let cursor = start;
  while (value[cursor] === ' ' || value[cursor] === '\t') {
    cursor += 1;
  }
  return cursor;
}

function findQuotedValueEnd(
  value: string,
  start: number,
  quote: string,
): number {
  let cursor = start;
  while (cursor < value.length) {
    if (value[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (value[cursor] === quote) {
      return cursor;
    }
    cursor += 1;
  }
  return value.length;
}

function findLineEnd(value: string, start: number): number {
  let cursor = start;
  while (
    cursor < value.length &&
    value[cursor] !== '\r' &&
    value[cursor] !== '\n'
  ) {
    cursor += 1;
  }
  return cursor;
}

function findHeaderValueEnd(value: string, start: number): number {
  let end = findLineEnd(value, start);

  while (end < value.length) {
    const nextLineStart =
      value[end] === '\r' && value[end + 1] === '\n' ? end + 2 : end + 1;
    if (value[nextLineStart] !== ' ' && value[nextLineStart] !== '\t') {
      break;
    }
    end = findLineEnd(value, nextLineStart);
  }

  return end;
}

function findUnquotedValueEnd(value: string, start: number): number {
  let cursor = start;
  while (cursor < value.length && !/[\s,;}\]]/.test(value[cursor] ?? '')) {
    cursor += 1;
  }
  return cursor;
}

function findSensitiveValueAt(
  value: string,
  start: number,
): TelemetryRedactionSpan | undefined {
  if (isIdentifierCharacter(value[start - 1])) {
    return undefined;
  }

  let cursor = start;
  let key: string;
  const keyQuote = value[cursor] === '"' || value[cursor] === "'";

  if (keyQuote) {
    const quote = value[cursor];
    const keyStart = cursor + 1;
    const keyEnd = findQuotedValueEnd(value, keyStart, quote);
    if (keyEnd >= value.length) {
      return undefined;
    }
    key = value.slice(keyStart, keyEnd);
    cursor = keyEnd + 1;
  } else {
    const keyStart = cursor;
    while (isIdentifierCharacter(value[cursor])) {
      cursor += 1;
    }
    if (cursor === keyStart) {
      return undefined;
    }
    key = value.slice(keyStart, cursor);
  }

  const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
  cursor = skipHorizontalWhitespace(value, cursor);

  if (normalizedKey === 'bearer' && cursor > start + key.length) {
    const valueStart = cursor;
    if (value.startsWith(TELEMETRY_REDACTION_TEXT.secret, valueStart)) {
      return undefined;
    }
    return {
      end: findUnquotedValueEnd(value, valueStart),
      start: valueStart,
    };
  }

  if (!TELEMETRY_SENSITIVE_KEYS.has(normalizedKey)) {
    return undefined;
  }

  const separator = value[cursor];
  if (separator !== ':' && separator !== '=') {
    return undefined;
  }
  cursor = skipHorizontalWhitespace(value, cursor + 1);

  if (normalizedKey === 'authorization' && !keyQuote) {
    if (value.startsWith(TELEMETRY_REDACTION_TEXT.secret, cursor)) {
      return undefined;
    }
    return {
      end: findHeaderValueEnd(value, cursor),
      start: cursor,
    };
  }

  if (value[cursor] === '"' || value[cursor] === "'") {
    const quote = value[cursor];
    if (value.startsWith(TELEMETRY_REDACTION_TEXT.secret, cursor + 1)) {
      return undefined;
    }
    return {
      end: findQuotedValueEnd(value, cursor + 1, quote),
      start: cursor + 1,
    };
  }

  if (value.startsWith(TELEMETRY_REDACTION_TEXT.secret, cursor)) {
    return undefined;
  }

  return {
    end:
      separator === ':' || normalizedKey === 'authorization'
        ? findHeaderValueEnd(value, cursor)
        : findUnquotedValueEnd(value, cursor),
    start: cursor,
  };
}

function redactSensitiveValues(value: string): string {
  const result: string[] = [];
  let copyFrom = 0;
  let cursor = 0;

  while (cursor < value.length) {
    const span = findSensitiveValueAt(value, cursor);
    if (!span || span.end <= span.start) {
      cursor += 1;
      continue;
    }

    result.push(
      value.slice(copyFrom, span.start),
      TELEMETRY_REDACTION_TEXT.secret,
    );
    copyFrom = span.end;
    cursor = span.end + 1;
  }

  result.push(value.slice(copyFrom));
  return result.join('');
}

export function sanitizeTelemetryText(
  value: string,
  maxLength: number,
): string {
  return redactSensitiveValues(value)
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
