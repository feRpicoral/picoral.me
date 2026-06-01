import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectStatus = z.enum(['live', 'beta', 'in-development', 'archived']);
const employmentType = z.enum(['fulltime', 'internship', 'founder', 'research', 'contract']);

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
    company: z.string(),
    role: z.string(),
    location: z.string(),
    period: z.object({
      start: z.string(),
      end: z.string().nullable().optional(),
    }),
    summary: z.string(),
    highlights: z.array(z.string()),
    tech: z.array(z.string()).optional(),
    type: employmentType,
    link: z.string().url().optional(),
    order: z.number(),
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
      start: z.string(),
      end: z.string().nullable().optional(),
    }),
    location: z.string(),
    order: z.number(),
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
