import { formatLongDate } from '@/core/utils/format-date';

describe('formatLongDate', () => {
  it('formats ISO dates using the requested locale', () => {
    expect(formatLongDate('2030-01-01T12:00:00.000Z', 'es-MX')).toBe(
      '1 de enero de 2030',
    );
  });

  it('accepts Date instances', () => {
    expect(formatLongDate(new Date(2030, 0, 1), 'en-US')).toBe(
      'January 1, 2030',
    );
  });

  it('returns null for invalid dates', () => {
    expect(formatLongDate('not-a-date', 'es-MX')).toBeNull();
  });
});
