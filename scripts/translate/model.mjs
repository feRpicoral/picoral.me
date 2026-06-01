import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { createProviderRegistry } from 'ai';
import { TRANSLATOR_MODEL } from './config.mjs';

/**
 * Providers the translator can route to, addressed as `<provider>/<model>`. Native
 * providers bill each vendor directly and read their own key env var
 * (ANTHROPIC_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY); `openrouter`
 * stays as a fallback for models you have no native key for (OPENROUTER_API_KEY).
 * The separator splits on the first `/`, so OpenRouter slugs that contain a slash
 * still resolve, e.g. `openrouter/anthropic/claude-sonnet-4.6`.
 */
const registry = createProviderRegistry(
  { anthropic, google, openai, openrouter },
  { separator: '/' },
);

/**
 * Resolve the active model id. Pure: reads the optional `TRANSLATE_MODEL` override,
 * falling back to the committed default. Holds no key and builds no provider, so
 * `hash.mjs` and `--check` can call it without an API key or a network call.
 */
export function resolveModelConfig() {
  return { modelId: process.env.TRANSLATE_MODEL || TRANSLATOR_MODEL };
}

const DEFAULT_MAX_OUTPUT_TOKENS = 8192;

/**
 * Max output tokens per request. Defaults to the model's general capacity; lower it
 * via TRANSLATE_MAX_OUTPUT_TOKENS for tight provider tiers — Anthropic sizes its
 * per-minute output-token limit off this, so on Sonnet tier 1 (8k/min) set 4096 or
 * less, otherwise a single request claims the whole budget.
 */
export function resolveMaxOutputTokens() {
  const raw = process.env.TRANSLATE_MAX_OUTPUT_TOKENS;
  if (!raw) return DEFAULT_MAX_OUTPUT_TOKENS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`TRANSLATE_MAX_OUTPUT_TOKENS must be a positive integer, got "${raw}".`);
  }
  return n;
}

/**
 * Resolve the AI SDK language model for the active id. Providers read their key
 * lazily at request time, so this is only meaningfully exercised in real translate
 * runs. Throws if the `<provider>/` prefix isn't a registered provider.
 */
export function getLanguageModel() {
  return registry.languageModel(resolveModelConfig().modelId);
}
