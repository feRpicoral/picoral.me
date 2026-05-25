import { type CollectionEntry, type CollectionKey, getCollection } from 'astro:content';
import { SITE, type Locale } from '~/config/site.ts';

const isLocale = (s: string): s is Locale => (SITE.locales as readonly string[]).includes(s);

const splitId = (id: string): { locale: Locale; slug: string } | null => {
  const segments = id.split('/');
  const head = segments[0];
  if (!head || !isLocale(head)) return null;
  return { locale: head, slug: segments.slice(1).join('/') };
};

/** Get all entries of a collection for a given locale. Falls back to EN where a translation is missing. */
export async function getLocalizedCollection<C extends CollectionKey>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>[]> {
  const all = await getCollection(collection);
  const byLocale = new Map<Locale, Map<string, CollectionEntry<C>>>();
  for (const entry of all) {
    const parsed = splitId(entry.id);
    if (!parsed) continue;
    if (!byLocale.has(parsed.locale)) byLocale.set(parsed.locale, new Map());
    byLocale.get(parsed.locale)!.set(parsed.slug, entry);
  }
  const target = byLocale.get(locale) ?? new Map();
  const fallback = byLocale.get(SITE.defaultLocale) ?? new Map();
  const slugs = new Set([...target.keys(), ...fallback.keys()]);
  return [...slugs]
    .map((slug) => target.get(slug) ?? fallback.get(slug))
    .filter((entry): entry is CollectionEntry<C> => Boolean(entry))
    .filter((entry) => {
      const data = entry.data as { draft?: boolean };
      return !data.draft;
    });
}

/** Find one entry by canonical slug in the requested locale; falls back to EN. */
export async function getLocalizedEntry<C extends CollectionKey>(
  collection: C,
  locale: Locale,
  slug: string,
): Promise<{ entry: CollectionEntry<C>; translated: boolean } | null> {
  const all = await getCollection(collection);
  let target: CollectionEntry<C> | undefined;
  let fallback: CollectionEntry<C> | undefined;
  for (const entry of all) {
    const parsed = splitId(entry.id);
    if (!parsed) continue;
    if (parsed.slug !== slug) continue;
    if (parsed.locale === locale) target = entry;
    if (parsed.locale === SITE.defaultLocale) fallback = entry;
  }
  const entry = target ?? fallback;
  if (!entry) return null;
  return { entry, translated: Boolean(target) };
}

/** Strip locale prefix from a content entry id and return its canonical slug. */
export function getCanonicalSlug(id: string): string {
  const parsed = splitId(id);
  return parsed?.slug ?? id;
}
