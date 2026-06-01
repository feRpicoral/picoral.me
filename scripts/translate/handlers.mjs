/**
 * Per-collection frontmatter handlers. Each handler declares which fields are
 * translatable and provides extract/inject functions. Everything else in
 * frontmatter is passed through unchanged.
 *
 * Snippet id convention: `fm:<dotted.path>` for frontmatter, `body:<index>` for
 * MDX body blocks (handled separately in mdx.mjs).
 */

const blog = {
  extract(fm) {
    const items = [
      { id: 'fm:title', kind: 'frontmatter:title', text: fm.title },
      {
        id: 'fm:description',
        kind: 'frontmatter:description',
        text: fm.description,
        max_chars: 160,
      },
    ];
    return items;
  },
  inject(fm, byId) {
    return {
      ...fm,
      title: byId['fm:title'],
      description: byId['fm:description'],
    };
  },
};

const projects = {
  extract(fm) {
    const items = [
      { id: 'fm:title', kind: 'frontmatter:title', text: fm.title },
      { id: 'fm:tagline', kind: 'frontmatter:tagline', text: fm.tagline, max_chars: 260 },
      { id: 'fm:summary', kind: 'frontmatter:summary', text: fm.summary },
      { id: 'fm:role', kind: 'frontmatter:role', text: fm.role },
    ];
    if (fm.coverAlt) {
      items.push({ id: 'fm:coverAlt', kind: 'frontmatter:coverAlt', text: fm.coverAlt });
    }
    if (fm.seo?.description) {
      items.push({
        id: 'fm:seo.description',
        kind: 'frontmatter:seo.description',
        text: fm.seo.description,
        max_chars: 220,
      });
    }
    if (Array.isArray(fm.faq)) {
      fm.faq.forEach((entry, i) => {
        items.push({ id: `fm:faq[${i}].q`, kind: 'frontmatter:faq.q', text: entry.q });
        items.push({ id: `fm:faq[${i}].a`, kind: 'frontmatter:faq.a', text: entry.a });
      });
    }
    return items;
  },
  inject(fm, byId) {
    const next = {
      ...fm,
      title: byId['fm:title'],
      tagline: byId['fm:tagline'],
      summary: byId['fm:summary'],
      role: byId['fm:role'],
    };
    if ('fm:coverAlt' in byId) next.coverAlt = byId['fm:coverAlt'];
    if ('fm:seo.description' in byId) {
      next.seo = { ...next.seo, description: byId['fm:seo.description'] };
    }
    if (Array.isArray(next.faq)) {
      next.faq = next.faq.map((entry, i) => ({
        ...entry,
        q: byId[`fm:faq[${i}].q`] ?? entry.q,
        a: byId[`fm:faq[${i}].a`] ?? entry.a,
      }));
    }
    return next;
  },
};

const experience = {
  extract(fm) {
    const items = [];
    if (Array.isArray(fm.education)) {
      fm.education.forEach((entry, i) => {
        items.push({
          id: `fm:education[${i}].degree`,
          kind: 'frontmatter:education.degree',
          text: entry.degree,
        });
        items.push({
          id: `fm:education[${i}].detail`,
          kind: 'frontmatter:education.detail',
          text: entry.detail,
        });
        items.push({
          id: `fm:education[${i}].location`,
          kind: 'frontmatter:education.location',
          text: entry.location,
        });
      });
    }
    if (Array.isArray(fm.work)) {
      fm.work.forEach((entry, i) => {
        items.push({ id: `fm:work[${i}].role`, kind: 'frontmatter:work.role', text: entry.role });
        items.push({
          id: `fm:work[${i}].location`,
          kind: 'frontmatter:work.location',
          text: entry.location,
        });
        items.push({
          id: `fm:work[${i}].summary`,
          kind: 'frontmatter:work.summary',
          text: entry.summary,
        });
        if (Array.isArray(entry.highlights)) {
          entry.highlights.forEach((h, j) => {
            items.push({
              id: `fm:work[${i}].highlights[${j}]`,
              kind: 'frontmatter:work.highlights',
              text: h,
            });
          });
        }
      });
    }
    return items;
  },
  inject(fm, byId) {
    const next = { ...fm };
    if (Array.isArray(next.education)) {
      next.education = next.education.map((entry, i) => ({
        ...entry,
        degree: byId[`fm:education[${i}].degree`] ?? entry.degree,
        detail: byId[`fm:education[${i}].detail`] ?? entry.detail,
        location: byId[`fm:education[${i}].location`] ?? entry.location,
      }));
    }
    if (Array.isArray(next.work)) {
      next.work = next.work.map((entry, i) => ({
        ...entry,
        role: byId[`fm:work[${i}].role`] ?? entry.role,
        location: byId[`fm:work[${i}].location`] ?? entry.location,
        summary: byId[`fm:work[${i}].summary`] ?? entry.summary,
        highlights: Array.isArray(entry.highlights)
          ? entry.highlights.map((h, j) => byId[`fm:work[${i}].highlights[${j}]`] ?? h)
          : entry.highlights,
      }));
    }
    return next;
  },
};

const pages = {
  extract(fm) {
    return [
      { id: 'fm:title', kind: 'frontmatter:title', text: fm.title },
      { id: 'fm:description', kind: 'frontmatter:description', text: fm.description },
    ];
  },
  inject(fm, byId) {
    return {
      ...fm,
      title: byId['fm:title'],
      description: byId['fm:description'],
    };
  },
};

export const HANDLERS = { blog, projects, experience, pages };

export function getHandler(collection) {
  const h = HANDLERS[collection];
  if (!h) throw new Error(`No translation handler for collection: ${collection}`);
  return h;
}
