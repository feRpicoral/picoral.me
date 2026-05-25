import type { Locale } from '~/config/site.ts';
import { bcp47 } from '~/i18n/utils.ts';

/**
 * Format a YYYY-MM or YYYY-MM-DD string into a localized "MMM YYYY" or "MMM YYYY" string.
 * Falls through unparseable values unchanged.
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
