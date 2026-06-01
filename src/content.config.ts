import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectStatus = z.enum(['live', 'beta', 'in-development', 'archived']);
const employmentType = z.enum(['fulltime', 'internship', 'founder', 'research', 'contract']);

function isPeriodDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = match[3] ? Number(match[3]) : 1;
  if (month < 1 || month > 12) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/**
 * Periods are entered with a date picker but rendered month + year only (the day is
 * ignored). Accepts `YYYY-MM` (translated files) or `YYYY-MM-DD`, and coerces a
 * YAML-parsed Date back to a string.
 */
const periodDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().refine(isPeriodDate, 'Use YYYY-MM or YYYY-MM-DD.'),
);

/** Preserve the full relative path (locale/slug) as the entry id, e.g. `en/cite`. */
const pathBasedId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

/**
 * Cache-key marker written to translated files by `scripts/translate-content.mjs`.
 * `hash` is sha256(source bytes + prompt + model + locale + config version).
 * `locked: true` opts a hand-edited translation out of regeneration.
 */
const sourceMarker = z
  .object({
    hash: z.string(),
    locale: z.string(),
    translatedAt: z.string(),
    locked: z.boolean().optional(),
  })
  .optional();

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: pathBasedId,
  }),
  schema: ({ image }) =>
    z
      .object({
        slug: z.string(),
        title: z.string(),
        tagline: z.string().max(260),
        summary: z.string(),
        status: projectStatus,
        role: z.string(),
        period: z.object({
          start: z.string(),
          end: z.string().optional(),
        }),
        stack: z.array(z.string()),
        links: z
          .object({
            live: z.string().url().optional(),
            repo: z.string().url().optional(),
            demo: z.string().url().optional(),
          })
          .optional(),
        cover: image().optional(),
        coverAlt: z.string().min(1).max(180).optional(),
        featured: z.boolean().default(false),
        order: z.number().default(0),
        hasCaseStudy: z.boolean().default(false),
        draft: z.boolean().default(false),
        seo: z.object({
          description: z.string().max(220),
          keywords: z.array(z.string()).optional(),
        }),
        faq: z
          .array(
            z.object({
              q: z.string(),
              a: z.string(),
            }),
          )
          .optional(),
        _source: sourceMarker,
      })
      .superRefine((data, ctx) => {
        if (data.cover && !data.coverAlt) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['coverAlt'],
            message: 'coverAlt is required when cover is set.',
          });
        }
      }),
});

const experience = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/experience',
    generateId: pathBasedId,
  }),
  schema: z.object({
    slug: z.string().optional(),
    company: z.string(),
    role: z.string(),
    location: z.string(),
    period: z.object({
      start: periodDate,
      end: periodDate.nullable().optional(),
    }),
    summary: z.string(),
    highlights: z.array(z.string()),
    tech: z.array(z.string()).optional(),
    type: employmentType,
    link: z.string().url().optional(),
    _source: sourceMarker,
  }),
});

const education = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/education',
    generateId: pathBasedId,
  }),
  schema: z.object({
    slug: z.string().optional(),
    degree: z.string(),
    school: z.string(),
    detail: z.string(),
    period: z.object({
      start: periodDate,
      end: periodDate.nullable().optional(),
    }),
    location: z.string(),
    _source: sourceMarker,
  }),
});

const blog = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/blog',
    generateId: pathBasedId,
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(160),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      tags: z.array(z.string()),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
      canonical: z.string().url().optional(),
      _source: sourceMarker,
    }),
});

const pages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/pages',
    generateId: pathBasedId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    _source: sourceMarker,
  }),
});

export const collections = { projects, experience, education, blog, pages };
