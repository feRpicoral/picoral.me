import type { Locale } from '~/config/site.ts';
import { bcp47 } from '~/i18n/utils.ts';

/**
 * Format period dates with a localized month and year.
 * Unparseable values pass through unchanged.
 */
export function formatPeriodDate(value: string | null | undefined, locale: Locale): string {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length < 2) return value;
  const [yearStr, monthStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return value;
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat(bcp47(locale), { month: 'short', year: 'numeric' }).format(date);
}

export function formatLongDate(value: Date | string, locale: Locale): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(bcp47(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

const ISO_OFFSET_RE = /([+-])(\d{2}):?(\d{2})$/;

function parseOffsetMinutes(iso: string): number {
  if (/[zZ]$/.test(iso)) return 0;
  const m = ISO_OFFSET_RE.exec(iso);
  if (!m) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

function formatOffsetLabel(minutes: number): string {
  if (minutes === 0) return 'UTC';
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `GMT${sign}${h}` : `GMT${sign}${h}:${String(m).padStart(2, '0')}`;
}

/**
 * Format an ISO 8601 timestamp at the UTC offset embedded in the string (the
 * commit's own zone), not the build machine's. Shifting the instant by the
 * offset and formatting in UTC reproduces the original wall-clock time, since
 * an SSG build cannot know the viewer's zone. Returns localized date, hour and
 * minute, and a GMT offset label.
 */
export function formatDateTimeTz(value: string, locale: Locale): string {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return '';
  const offsetMinutes = parseOffsetMinutes(value);
  const wall = new Date(ms + offsetMinutes * 60_000);
  const formatted = new Intl.DateTimeFormat(bcp47(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(wall);
  return `${formatted} ${formatOffsetLabel(offsetMinutes)}`;
}
