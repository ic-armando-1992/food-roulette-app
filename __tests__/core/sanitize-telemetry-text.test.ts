import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { sanitizeErrorText } from '@/core/telemetry/telemetry';

type RedactionCorpusEntry = {
  expected: string;
  input: string;
  name: string;
};

const corpus = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'test-contracts/telemetry-redaction-corpus.json'),
    'utf8',
  ),
) as RedactionCorpusEntry[];

describe('sanitizeErrorText', () => {
  it.each(corpus)('$name', ({ expected, input }) => {
    expect(sanitizeErrorText(input, 10_000)).toBe(expected);
    expect(sanitizeErrorText(expected, 10_000)).toBe(expected);
  });
});
