import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { TRANSLATOR_MODEL } from './config.mjs';

/**
 * Resolve the active model slug. Pure: reads the optional `TRANSLATE_MODEL`
 * override, falling back to the committed default. Holds no key and never
 * builds the provider, so `hash.mjs` and `--check` can call it without an API
 * key or a network call.
 */
export function resolveModelConfig() {
  return { modelId: process.env.TRANSLATE_MODEL || TRANSLATOR_MODEL };
}

let provider = null;

/**
 * Build the AI SDK language model for the resolved slug, routed through
 * OpenRouter. Only called in real translate runs, so the key check lives here
 * rather than in `resolveModelConfig`.
 */
export function getLanguageModel() {
  const { modelId } = resolveModelConfig();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not set. Translation requires the env var; add it to your shell or .env.local for local runs.',
    );
  }
  if (!provider) provider = createOpenRouter({ apiKey });
  return provider(modelId);
}
