import { TRANSLATOR_MODEL } from './config.mjs';

/**
 * Resolve the active model id — a Vercel AI Gateway slug (`creator/model`, e.g.
 * `anthropic/claude-sonnet-4.6`). Pure: reads the optional TRANSLATE_MODEL override,
 * falling back to the committed default. The AI SDK routes this string through the
 * gateway (its default global provider), so `hash.mjs` and `--check` can call this
 * without an API key or a network call.
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
