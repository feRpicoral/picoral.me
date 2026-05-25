import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectStatus = z.enum(['live', 'beta', 'in-development', 'archived']);
const employmentType = z.enum(['fulltime', 'internship', 'founder', 'research', 'contract']);

/** Preserve the full relative path (locale/slug) as the entry id, e.g. `en/cite`. */
const pathBasedId = ({ entry }: { entry: string }) => entry.replace(/\.(md|mdx)$/, '');

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/projects',
    generateId: pathBasedId,
  }),
  schema: ({ image }) =>
    z.object({
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
      coverAlt: z.string().optional(),
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
      end: z.string().nullable(),
    }),
    summary: z.string(),
    highlights: z.array(z.string()),
    tech: z.array(z.string()).optional(),
    type: employmentType,
    link: z.string().url().optional(),
    order: z.number(),
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
      translationKey: z.string(),
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
  }),
});

export const collections = { projects, experience, blog, pages };
