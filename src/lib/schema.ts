import { type Locale, SITE } from '~/config/site.ts';

export function personSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    image: `${SITE.url}/og/default.png`,
    jobTitle: SITE.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: SITE.employer,
      url: 'https://about.google',
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
    inLanguage: locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'es',
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
  category?: string;
  operatingSystem?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    applicationCategory: input.category ?? 'BusinessApplication',
    operatingSystem: input.operatingSystem ?? 'Web',
    url: input.url,
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
    inLanguage: input.locale === 'en' ? 'en-US' : input.locale === 'pt' ? 'pt-BR' : 'es',
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
  };
}
