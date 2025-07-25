import { describe, it, expect } from 'vitest';
import { formatDate } from './utils.js';

describe('formatDate()', () => {
  it('formats ISO dates to "Thu, Jul 24" style (UTC)', () => {
    const result = formatDate('2025-07-24T15:30:00Z');
    expect(result).toMatch(/^Thu,\s*Jul\s*24$/);
  });
});