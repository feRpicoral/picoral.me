import { type CollectionEntry, type CollectionKey, getCollection } from 'astro:content';
import { type Locale, SITE } from '~/config/site.ts';

const isLocale = (s: string): s is Locale => (SITE.locales as readonly string[]).includes(s);

const splitId = (id: string): { locale: Locale; slug: string } | null => {
  const segments = id.split('/');
  const head = segments[0];
  if (!head || !isLocale(head)) return null;
  return { locale: head, slug: segments.slice(1).join('/') };
};

export async function getLocalizedCollection<C extends CollectionKey>(
  collection: C,
  locale: Locale,
): Promise<CollectionEntry<C>[]> {
  const all = await getCollection(collection);
  return all.filter((entry) => {
    if (!entry.id.startsWith(`${locale}/`)) return false;
    const data = entry.data as { draft?: boolean };
    return !data.draft;
  });
}

export async function getLocalizedEntry<C extends CollectionKey>(
  collection: C,
  locale: Locale,
  slug: string,
): Promise<CollectionEntry<C> | null> {
  const all = await getCollection(collection);
  return all.find((entry) => entry.id === `${locale}/${slug}`) ?? null;
}

export function getCanonicalSlug(id: string): string {
  const parsed = splitId(id);
  return parsed?.slug ?? id;
}
