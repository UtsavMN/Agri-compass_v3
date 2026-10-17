/**
 * AgriCompass Precision Date & Time Utility Suite
 * 
 * Standardized on Indian Standard Time (IST, Asia/Kolkata, UTC+05:30)
 * to ensure all agricultural data, weather updates, mandi price tickers,
 * and community transmissions accurately display local Karnataka time.
 */

export const APP_TIMEZONE = 'Asia/Kolkata';
export const APP_LOCALE = 'en-IN';

/**
 * Safely parses any date string, timestamp number, or Date object into a valid Date.
 * Handles UTC ISO strings, epoch seconds/ms, strings without timezone offsets,
 * and date-only YYYY-MM-DD representations without shifting across calendar days.
 */
export function parseSafeDate(input: string | number | Date | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    // If epoch seconds (10 digits), convert to ms
    const ms = input < 10_000_000_000 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // 1. Date-only format: "YYYY-MM-DD"
    // Parse parts directly as local calendar date so timezone differences never roll the date backwards.
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // 2. Date with time
    let iso = trimmed.replace(' ', 'T');

    // If missing timezone offset (no 'Z' and no '+/-HH:mm')
    // Server timestamps stored in UTC need 'Z' so browsers parse as UTC and convert to IST.
    const hasTzOffset = /([+-]\d{2}(:?\d{2})?|Z)$/i.test(iso);
    if (!hasTzOffset) {
      iso += 'Z';
    }

    const d = new Date(iso);
    if (!isNaN(d.getTime())) {
      return d;
    }

    // Fallback attempt without appended Z
    const fallback = new Date(trimmed);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  return null;
}

/**
 * Formats time as "hh:mm AM/PM" in IST (Asia/Kolkata).
 * E.g., "09:45 AM"
 */
export function formatTime(input: string | number | Date | null | undefined): string {
  const d = parseSafeDate(input);
  if (!d) return '';

  return d.toLocaleTimeString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Formats date as "DD MMM YYYY" in IST (Asia/Kolkata).
 * E.g., "17 Oct 2026"
 */
export function formatDate(input: string | number | Date | null | undefined): string {
  const d = parseSafeDate(input);
  if (!d) return '';

  return d.toLocaleDateString(APP_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Formats date and time as "DD MMM YYYY, hh:mm AM/PM" in IST (Asia/Kolkata).
 * E.g., "17 Oct 2026, 09:45 AM"
 */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  const d = parseSafeDate(input);
  if (!d) return '';

  const dateStr = d.toLocaleDateString(APP_LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: APP_TIMEZONE,
  });

  const timeStr = d.toLocaleTimeString(APP_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: APP_TIMEZONE,
  });

  return `${dateStr}, ${timeStr}`;
}

/**
 * Formats relative time (e.g. "just now", "5m ago", "2h ago", "yesterday", "3d ago", or "17 Oct 2026").
 * Handles small clock discrepancies gracefully.
 */
export function formatRelativeTime(input: string | number | Date | null | undefined): string {
  const d = parseSafeDate(input);
  if (!d) return '';

  const now = Date.now();
  const diffMs = now - d.getTime();

  // Within 60 seconds (or slightly in future due to slight client/server clock offset)
  if (diffMs < 60_000) {
    return 'just now';
  }

  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 1) {
    return 'yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return formatDate(d);
}

/**
 * Formats compact relative time (e.g. "now", "5m", "2h", "17 Oct") for chat & messages.
 */
export function formatCompactRelativeTime(input: string | number | Date | null | undefined): string {
  const d = parseSafeDate(input);
  if (!d) return '';

  const now = Date.now();
  const diffMs = now - d.getTime();

  if (diffMs < 60_000) return 'now';
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours}h`;

  return d.toLocaleDateString(APP_LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Formats a forecast day title: "Today", "Tomorrow", or weekday name ("Saturday", "Sunday").
 */
export function formatForecastDay(dateStr: string, index?: number): string {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';

  const d = parseSafeDate(dateStr);
  if (!d) return 'Upcoming';

  return d.toLocaleDateString(APP_LOCALE, {
    weekday: 'long',
    timeZone: APP_TIMEZONE,
  });
}

/**
 * Formats a forecast date string e.g. "Sat, Oct 17" or "Sat, 17 Oct".
 */
export function formatForecastDate(dateStr: string): string {
  const d = parseSafeDate(dateStr);
  if (!d) return dateStr;

  return d.toLocaleDateString(APP_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: APP_TIMEZONE,
  });
}
