/**
 * Bump this when changing the prompt template, the per-collection field handlers,
 * or any other input to translation that should invalidate every existing cache entry.
 */
export const TRANSLATOR_CONFIG_VERSION = 2;

// Committed default translator model as `<provider>/<model>`, where <provider> is
// one registered in model.mjs (anthropic, google, openai, openrouter). Native
// providers bill that vendor directly; TRANSLATE_MODEL overrides this for a single
// local run, and editing it here changes it for good (re-translate afterwards).
export const TRANSLATOR_MODEL = 'anthropic/claude-sonnet-4-6';

export const SOURCE_LOCALE = 'en';
export const TARGET_LOCALES = ['pt', 'es'];

export const COLLECTIONS = ['blog', 'projects', 'experience', 'pages'];

export const LOCALE_NAMES = {
  pt: 'Brazilian Portuguese',
  es: 'Latin American Spanish',
};

export const LOCALE_STYLE = {
  pt: 'Brazilian Portuguese (pt-BR), natural for a Brazilian audience. Avoid European Portuguese vocabulary and grammar.',
  es: 'Neutral Latin American Spanish. Avoid Castilian-only vocabulary (use "computadora" not "ordenador", "celular" not "móvil", etc.).',
};
