import { describe, it, expect } from 'vitest';
import { parseSafeDate, formatDate, formatDateTime, formatTime, formatRelativeTime } from '../lib/dateUtils';

describe('dateUtils - Timezone, Parsing and Regression Tests', () => {
  it('parses valid ISO string with UTC offset', () => {
    const d = parseSafeDate('2026-10-17T12:00:00Z');
    expect(d).toBeInstanceOf(Date);
    expect(d?.toISOString()).toBe('2026-10-17T12:00:00.000Z');
  });

  it('parses epoch seconds timestamp correctly (converts to ms)', () => {
    const epochSec = 1700000000;
    const d = parseSafeDate(epochSec);
    expect(d?.getTime()).toBe(epochSec * 1000);
  });

  it('parses epoch milliseconds timestamp correctly', () => {
    const epochMs = 1700000000000;
    const d = parseSafeDate(epochMs);
    expect(d?.getTime()).toBe(epochMs);
  });

  it('handles null, undefined and empty strings safely by returning null', () => {
    expect(parseSafeDate(null)).toBeNull();
    expect(parseSafeDate(undefined)).toBeNull();
    expect(parseSafeDate('')).toBeNull();
    expect(parseSafeDate('   ')).toBeNull();
  });

  it('formatDate returns formatted date string in Indian locale/format', () => {
    const formatted = formatDate('2026-10-17T06:30:00Z');
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('2026');
  });

  it('formatDateTime returns both date and time', () => {
    const formatted = formatDateTime('2026-10-17T06:30:00Z');
    expect(formatted).toBeTruthy();
    expect(formatted).toContain('2026');
  });

  it('formatRelativeTime returns accurate relative representation', () => {
    const now = Date.now();
    const tenMinAgo = now - 10 * 60 * 1000;
    const rel = formatRelativeTime(tenMinAgo);
    expect(rel.toLowerCase()).toMatch(/min|ago|just now/);
  });

  it('returns fallback empty string for completely invalid date inputs without crashing', () => {
    expect(formatDate('invalid-date-string')).toBe('');
    expect(formatDateTime('not-a-date')).toBe('');
  });
});
