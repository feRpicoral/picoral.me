/**
 * Email is split into `user` and `domain` so the literal address is never written
 * to server-rendered HTML or static assets. Base.astro wires data-email-* links,
 * and CopyEmail joins the same parts for clipboard use.
 */
export const SITE = {
  name: 'Fernando Picoral',
  shortName: 'Picoral',
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://picoral.me',
  emailUser: 'fernando',
  emailDomain: 'picoral.me',
  location: 'New York, NY',
  jobTitle: 'Software Engineer',
  employer: 'Google',
  alumniOf: 'University of Colorado Boulder',
  nationality: 'BR',
  description:
    'Brazilian software engineer based in New York. Software Engineer at Google (full-time from September 2026, after three summer internships). BS in Computer Science from CU Boulder, May 2026.',
  socials: {
    github: 'https://github.com/feRpicoral',
    linkedin: 'https://www.linkedin.com/in/picoral',
  },
  defaultLocale: 'en' as const,
  locales: ['en', 'pt', 'es'] as const,
} as const;

export type Locale = (typeof SITE.locales)[number];

export const EDUCATION = [
  {
    degree: 'Bachelor of Science in Computer Science',
    school: 'University of Colorado Boulder',
    detail: 'Major GPA 3.9 / 4.0',
    period: { start: '2022-08', end: '2026-05' },
    location: 'Boulder, CO',
  },
  {
    degree: 'Minor in Business Administration',
    school: 'University of Colorado Boulder',
    detail: 'GPA 3.9 / 4.0',
    period: { start: '2023-08', end: '2025-08' },
    location: 'Boulder, CO',
  },
] as const;

export const FOREIGN_LANGUAGES = [
  { language: 'Portuguese', level: 'native' as const },
  { language: 'English', level: 'fluent' as const },
  { language: 'Spanish', level: 'working' as const },
] as const;

export const TECHNICAL_SKILLS = {
  languages: ['TypeScript', 'JavaScript', 'Java', 'Kotlin', 'Dart', 'Python', 'C++', 'Go'],
  frameworks: [
    'Next.js',
    'React',
    'React Native',
    'Angular',
    'NestJS',
    'Express',
    'Pandas',
    'NumPy',
    'scikit-learn',
  ],
  databases: ['PostgreSQL', 'MongoDB', 'Spanner', 'MySQL', 'Redis'],
  other: ['Docker', 'Git', 'Mercurial', 'Unix', 'HTML', 'CSS', 'SCSS', 'CI/CD', 'AWS'],
} as const;
