/**
 * Bump this when changing the prompt template, the per-collection field handlers,
 * or any other input to translation that should invalidate every existing cache entry.
 */
export const TRANSLATOR_CONFIG_VERSION = 2;

// Committed default translator model as a Vercel AI Gateway slug (`creator/model`,
// see vercel.com/ai-gateway/models). TRANSLATE_MODEL overrides it for a single local
// run; editing it here changes it for good (re-translate or `--rehash` afterwards).
export const TRANSLATOR_MODEL = 'anthropic/claude-sonnet-4.6';

export const SOURCE_LOCALE = 'en';
export const TARGET_LOCALES = ['pt', 'es'];

export const COLLECTIONS = ['blog', 'projects', 'experience', 'education', 'pages'];

export const LOCALE_NAMES = {
  pt: 'Brazilian Portuguese',
  es: 'Latin American Spanish',
};

export const LOCALE_STYLE = {
  pt: 'Brazilian Portuguese (pt-BR), natural for a Brazilian audience. Avoid European Portuguese vocabulary and grammar.',
  es: 'Neutral Latin American Spanish. Avoid Castilian-only vocabulary (use "computadora" not "ordenador", "celular" not "móvil", etc.).',
};
