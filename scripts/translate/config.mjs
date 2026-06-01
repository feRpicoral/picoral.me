/**
 * Bump this when changing the prompt template, the per-collection field handlers,
 * or any other input to translation that should invalidate every existing cache entry.
 */
export const TRANSLATOR_CONFIG_VERSION = 2;

// Committed default model, as an OpenRouter slug (see openrouter.ai/models).
// TRANSLATE_MODEL overrides it for a single local run; edit this to change it for good.
export const TRANSLATOR_MODEL = 'google/gemini-2.5-flash-lite';

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
