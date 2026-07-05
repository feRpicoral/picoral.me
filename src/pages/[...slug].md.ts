import { type CollectionEntry, getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { isEnabled } from '~/config/sections.ts';
import { SITE } from '~/config/site.ts';
import { getHomeFaq } from '~/data/home-faq.ts';
import type { UiKey } from '~/i18n/ui.ts';
import { useTranslations } from '~/i18n/utils.ts';
import { getCanonicalSlug, getLocalizedCollection, getLocalizedEntry } from '~/lib/content.ts';
import { formatLongDate, formatPeriodRange, periodSortKey } from '~/lib/format.ts';
import { mdxToMarkdown } from '~/lib/markdown-export.mjs';

export const prerender = true;

// English-only: the `.md` twins mirror the unprefixed (default-locale) HTML pages.
const LOCALE = SITE.defaultLocale;
const t = useTranslations(LOCALE);

type Twin =
  | { kind: 'home' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'experience' }
  | { kind: 'projectsIndex' }
  | { kind: 'blogIndex' }
  | { kind: 'project'; slug: string }
  | { kind: 'blogPost'; slug: string };

type Path = { params: { slug: string }; props: Twin };

/**
 * Enumerate only pages that have a real HTML twin so no advertised `.md` 404s:
 * project details are gated on `hasCaseStudy` (three projects have none), and the
 * blog is gated on its section flag. Home maps to `/index.md`.
 */
export async function getStaticPaths(): Promise<Path[]> {
  const paths: Path[] = [{ params: { slug: 'index' }, props: { kind: 'home' } }];

  if (isEnabled('about')) paths.push({ params: { slug: 'about' }, props: { kind: 'about' } });
  if (isEnabled('experience'))
    paths.push({ params: { slug: 'experience' }, props: { kind: 'experience' } });
  if (isEnabled('contact')) paths.push({ params: { slug: 'contact' }, props: { kind: 'contact' } });
  if (isEnabled('projects'))
    paths.push({ params: { slug: 'projects' }, props: { kind: 'projectsIndex' } });

  if (isEnabled('projects') && isEnabled('projectCaseStudies')) {
    const seen = new Set<string>();
    for (const entry of await getCollection('projects', ({ data }) => !data.draft)) {
      if (!entry.id.startsWith('en/') || !entry.data.hasCaseStudy) continue;
      const slug = getCanonicalSlug(entry.id);
      if (seen.has(slug)) continue;
      seen.add(slug);
      paths.push({ params: { slug: `projects/${slug}` }, props: { kind: 'project', slug } });
    }
  }

  if (isEnabled('blog')) {
    paths.push({ params: { slug: 'blog' }, props: { kind: 'blogIndex' } });
    const seen = new Set<string>();
    for (const entry of await getCollection('blog', ({ data }) => !data.draft)) {
      if (!entry.id.startsWith('en/')) continue;
      const slug = getCanonicalSlug(entry.id);
      if (seen.has(slug)) continue;
      seen.add(slug);
      paths.push({ params: { slug: `blog/${slug}` }, props: { kind: 'blogPost', slug } });
    }
  }

  return paths;
}

const finalize = (blocks: Array<string | false | null | undefined>): string =>
  `${blocks.filter(Boolean).join('\n\n').trim()}\n`;

const projectLine = (p: CollectionEntry<'projects'>): string => {
  const slug = getCanonicalSlug(p.id);
  const href = p.data.hasCaseStudy
    ? `${SITE.url}/projects/${slug}`
    : (p.data.links?.live ?? p.data.links?.repo);
  const label = href ? `[${p.data.title}](${href})` : p.data.title;
  return `- ${label} — ${p.data.tagline}`;
};

async function buildHome(): Promise<string> {
  const featured = (await getLocalizedCollection('projects', LOCALE))
    .filter((p) => p.data.featured)
    .sort((a, b) => a.data.order - b.data.order)
    .slice(0, 4);

  const blocks: Array<string | false | undefined> = [
    `# ${SITE.name}`,
    t('home.hero.lead'),
    `Source: ${SITE.url}/`,
  ];
  if (featured.length > 0) {
    blocks.push(`## ${t('home.projects.title')}`, featured.map(projectLine).join('\n'));
  }
  blocks.push(`## ${t('home.faq.title')}`);
  for (const item of getHomeFaq(LOCALE)) blocks.push(`### ${item.q}\n\n${item.a}`);
  return finalize(blocks);
}

async function buildAbout(): Promise<string> {
  const entry = await getLocalizedEntry('pages', LOCALE, 'about');
  return finalize([
    `# ${SITE.name}`,
    t('about.lead'),
    `Source: ${SITE.url}/about`,
    entry && mdxToMarkdown(entry.body ?? ''),
  ]);
}

async function buildContact(): Promise<string> {
  const entry = await getLocalizedEntry('pages', LOCALE, 'contact');
  return finalize([
    `# ${t('contact.title')}`,
    t('contact.lead'),
    `Source: ${SITE.url}/contact`,
    entry && mdxToMarkdown(entry.body ?? ''),
    `## ${t('contact.social.title')}`,
    [`- GitHub: ${SITE.socials.github}`, `- LinkedIn: ${SITE.socials.linkedin}`].join('\n'),
  ]);
}

async function buildExperience(): Promise<string> {
  const byRecency = <T extends { data: { period: { start: string; end?: string | null } } }>(
    entries: T[],
  ): T[] =>
    [...entries].sort((a, b) =>
      periodSortKey(b.data.period).localeCompare(periodSortKey(a.data.period)),
    );

  const education = byRecency(await getLocalizedCollection('education', LOCALE));
  const work = byRecency(await getLocalizedCollection('experience', LOCALE));

  const blocks: Array<string | false | undefined> = [
    `# ${t('experience.title')}`,
    t('experience.lead'),
    `Source: ${SITE.url}/experience`,
    `## ${t('experience.education.title')}`,
  ];
  for (const { data } of education) {
    const period = formatPeriodRange(data.period.start, data.period.end, LOCALE);
    blocks.push(
      [
        `### ${data.degree}`,
        `${data.school} · ${data.location}${period ? ` · ${period}` : ''}`,
        data.detail,
      ].join('\n\n'),
    );
  }
  blocks.push(`## ${t('experience.work.title')}`);
  for (const { data } of work) {
    const period = formatPeriodRange(
      data.period.start,
      data.period.end,
      LOCALE,
      t('experience.present'),
    );
    const typeLabel = t(`experience.type.${data.type}` as UiKey);
    const parts = [
      `### ${data.role} — ${data.company}`,
      `${data.location} · ${typeLabel}${period ? ` · ${period}` : ''}`,
      data.summary,
      data.highlights.map((h) => `- ${h}`).join('\n'),
    ];
    if (data.tech && data.tech.length > 0) parts.push(`Tech: ${data.tech.join(', ')}`);
    blocks.push(parts.join('\n\n'));
  }
  return finalize(blocks);
}

async function buildProjectsIndex(): Promise<string> {
  const all = await getLocalizedCollection('projects', LOCALE);
  const byOrder = (a: CollectionEntry<'projects'>, b: CollectionEntry<'projects'>) =>
    a.data.order - b.data.order;
  const featured = all.filter((p) => p.data.featured).sort(byOrder);
  const other = all.filter((p) => !p.data.featured).sort(byOrder);

  const blocks: Array<string | false | undefined> = [
    `# ${t('projects.title')}`,
    t('projects.lead'),
    `Source: ${SITE.url}/projects`,
  ];
  if (featured.length > 0) {
    blocks.push(`## ${t('projects.featured')}`, featured.map(projectLine).join('\n'));
  }
  if (other.length > 0) {
    blocks.push(`## ${t('projects.other')}`, other.map(projectLine).join('\n'));
  }
  return finalize(blocks);
}

async function buildProject(slug: string): Promise<string> {
  const entry = await getLocalizedEntry('projects', LOCALE, slug);
  if (!entry) return finalize([`# ${slug}`]);
  const { data } = entry;
  const period = formatPeriodRange(
    data.period.start,
    data.period.end,
    LOCALE,
    t('experience.present'),
  );
  const links = [
    data.links?.live && `[Live](${data.links.live})`,
    data.links?.repo && `[Repo](${data.links.repo})`,
    data.links?.demo && `[Demo](${data.links.demo})`,
  ]
    .filter(Boolean)
    .join(' · ');
  const meta = [
    `- Status: ${data.status}`,
    `- Role: ${data.role}`,
    period && `- Period: ${period}`,
    data.stack.length > 0 && `- Stack: ${data.stack.join(', ')}`,
    links && `- Links: ${links}`,
    `- Canonical: ${SITE.url}/projects/${slug}`,
  ]
    .filter(Boolean)
    .join('\n');

  const blocks: Array<string | false | undefined> = [
    `# ${data.title}`,
    data.tagline,
    meta,
    mdxToMarkdown(entry.body ?? ''),
  ];
  if (data.faq && data.faq.length > 0) {
    blocks.push(`## ${t('projects.faq')}`);
    for (const item of data.faq) blocks.push(`### ${item.q}\n\n${item.a}`);
  }
  return finalize(blocks);
}

async function buildBlogIndex(): Promise<string> {
  const posts = (await getLocalizedCollection('blog', LOCALE)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
  const blocks: Array<string | false | undefined> = [
    `# ${t('nav.blog')}`,
    `Source: ${SITE.url}/blog`,
  ];
  if (posts.length > 0) {
    blocks.push(
      posts
        .map(
          (p) =>
            `- [${p.data.title}](${SITE.url}/blog/${getCanonicalSlug(p.id)}) — ${p.data.description}`,
        )
        .join('\n'),
    );
  }
  return finalize(blocks);
}

async function buildBlogPost(slug: string): Promise<string> {
  const entry = await getLocalizedEntry('blog', LOCALE, slug);
  if (!entry) return finalize([`# ${slug}`]);
  const { data } = entry;
  const updated =
    data.updatedAt && data.updatedAt.getTime() !== data.publishedAt.getTime()
      ? `- Updated: ${formatLongDate(data.updatedAt, LOCALE)}`
      : false;
  const meta = [
    `- Published: ${formatLongDate(data.publishedAt, LOCALE)}`,
    updated,
    data.tags.length > 0 && `- Tags: ${data.tags.join(', ')}`,
    `- Canonical: ${SITE.url}/blog/${slug}`,
  ]
    .filter(Boolean)
    .join('\n');
  return finalize([`# ${data.title}`, data.description, meta, mdxToMarkdown(entry.body ?? '')]);
}

const buildDocument = (props: Twin): Promise<string> => {
  switch (props.kind) {
    case 'home':
      return buildHome();
    case 'about':
      return buildAbout();
    case 'contact':
      return buildContact();
    case 'experience':
      return buildExperience();
    case 'projectsIndex':
      return buildProjectsIndex();
    case 'blogIndex':
      return buildBlogIndex();
    case 'project':
      return buildProject(props.slug);
    case 'blogPost':
      return buildBlogPost(props.slug);
  }
};

export const GET: APIRoute<Twin> = async ({ props }) => {
  const markdown = await buildDocument(props);
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
