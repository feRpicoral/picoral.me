import { type Locale, SITE } from '~/config/site.ts';

type SchemaImage = string | { url: string; caption?: string };

function inLanguage(locale: Locale): string {
  return locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'es';
}

function schemaImage(image: SchemaImage): string | Record<string, unknown> {
  if (typeof image === 'string') return image;
  return {
    '@type': 'ImageObject',
    url: image.url,
    ...(image.caption ? { caption: image.caption } : {}),
  };
}

export function personSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    image: `${SITE.url}/og/default.png`,
    jobTitle: SITE.jobTitle,
    // Wrapped in OrganizationRole with startDate so crawlers don't read this
    // as a current employment claim while the offer is still future-dated.
    worksFor: {
      '@type': 'OrganizationRole',
      startDate: '2026-09',
      worksFor: {
        '@type': 'Organization',
        name: SITE.employer,
        url: 'https://about.google',
      },
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: SITE.alumniOf,
      url: 'https://www.colorado.edu',
    },
    nationality: {
      '@type': 'Country',
      name: 'Brazil',
    },
    knowsLanguage: ['en-US', 'pt-BR', 'es'],
    knowsAbout: [
      'Software Engineering',
      'Backend infrastructure',
      'Distributed systems',
      'gRPC',
      'Full-stack web development',
      'AI Engineering',
      'TypeScript',
      'Java',
      'Kotlin',
      'Python',
      'React',
      'Next.js',
      'PostgreSQL',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New York',
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    // Email intentionally omitted from JSON-LD as an anti-spam measure; the
    // address is rendered client-side from split user/domain parts instead.
    sameAs: [SITE.socials.github, SITE.socials.linkedin],
  };
}

export function websiteSchema(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: inLanguage(locale),
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(faq: Array<{ q: string; a: string }>): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function softwareApplicationSchema(input: {
  name: string;
  description: string;
  url?: string;
  image?: SchemaImage;
  category?: string;
  operatingSystem?: string;
  datePublished?: string;
  dateModified?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    applicationCategory: input.category ?? 'BusinessApplication',
    operatingSystem: input.operatingSystem ?? 'Web',
    url: input.url,
    ...(input.image ? { image: schemaImage(input.image) } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function webPageSchema(input: {
  name: string;
  description: string;
  url: string;
  locale: Locale;
  primaryImage?: SchemaImage;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: inLanguage(input.locale),
    ...(input.primaryImage ? { primaryImageOfPage: schemaImage(input.primaryImage) } : {}),
  };
}

export function blogPostingSchema(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: Date;
  updatedAt?: Date;
  locale: Locale;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.publishedAt.toISOString(),
    dateModified: (input.updatedAt ?? input.publishedAt).toISOString(),
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Person', name: SITE.name, url: SITE.url },
    inLanguage: inLanguage(input.locale),
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  };
}
