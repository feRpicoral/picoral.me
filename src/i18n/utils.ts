import { type Locale, SITE } from '~/config/site.ts';
import { type UiKey, ui } from './ui.ts';

const isLocale = (value: string): value is Locale =>
  (SITE.locales as readonly string[]).includes(value);

export function getLocaleFromUrl(url: URL): Locale {
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && isLocale(first)) return first;
  return SITE.defaultLocale;
}

export function useTranslations(locale: Locale) {
  return function t(key: UiKey, vars?: Record<string, string | number>): string {
    const value = (ui[locale] as Record<string, string>)[key] ?? ui.en[key] ?? key;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
  };
}

export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === SITE.defaultLocale) return clean === '/' ? '/' : clean;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

export function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  const first = segments[0];
  if (first && isLocale(first) && first !== SITE.defaultLocale) {
    const rest = segments.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname === '' ? '/' : pathname;
}

export function getAlternates(
  canonicalPath: string,
): Array<{ locale: Locale | 'x-default'; href: string }> {
  return [
    ...SITE.locales.map((locale) => ({
      locale,
      href: new URL(localizePath(canonicalPath, locale), SITE.url).toString(),
    })),
    {
      locale: 'x-default' as const,
      href: new URL(localizePath(canonicalPath, SITE.defaultLocale), SITE.url).toString(),
    },
  ];
}

export function swapLocale(currentPath: string, targetLocale: Locale): string {
  const canonical = stripLocale(currentPath);
  return localizePath(canonical, targetLocale);
}

export function bcp47(locale: Locale): string {
  switch (locale) {
    case 'pt':
      return 'pt-BR';
    case 'es':
      return 'es';
    case 'en':
      return 'en-US';
  }
}
