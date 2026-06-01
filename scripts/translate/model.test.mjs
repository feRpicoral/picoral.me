import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { TRANSLATOR_MODEL } from './config.mjs';
import { getLanguageModel, resolveMaxOutputTokens, resolveModelConfig } from './model.mjs';

let savedModel;
let savedMaxTokens;

beforeEach(() => {
  savedModel = process.env.TRANSLATE_MODEL;
  savedMaxTokens = process.env.TRANSLATE_MAX_OUTPUT_TOKENS;
});

afterEach(() => {
  process.env.TRANSLATE_MODEL = savedModel ?? '';
  process.env.TRANSLATE_MAX_OUTPUT_TOKENS = savedMaxTokens ?? '';
});

test('resolveModelConfig falls back to the config default when TRANSLATE_MODEL is unset', () => {
  process.env.TRANSLATE_MODEL = '';

  assert.equal(resolveModelConfig().modelId, TRANSLATOR_MODEL);
});

test('resolveModelConfig honors the TRANSLATE_MODEL override', () => {
  process.env.TRANSLATE_MODEL = 'google/gemini-2.5-flash-lite';

  assert.equal(resolveModelConfig().modelId, 'google/gemini-2.5-flash-lite');
});

test('getLanguageModel throws on an unregistered provider', () => {
  process.env.TRANSLATE_MODEL = 'bogus/whatever';

  assert.throws(() => getLanguageModel());
});

test('resolveMaxOutputTokens defaults when TRANSLATE_MAX_OUTPUT_TOKENS is unset', () => {
  process.env.TRANSLATE_MAX_OUTPUT_TOKENS = '';

  assert.equal(resolveMaxOutputTokens(), 8192);
});

test('resolveMaxOutputTokens honors a valid override', () => {
  process.env.TRANSLATE_MAX_OUTPUT_TOKENS = '4096';

  assert.equal(resolveMaxOutputTokens(), 4096);
});

test('resolveMaxOutputTokens throws on a non-positive-integer override', () => {
  process.env.TRANSLATE_MAX_OUTPUT_TOKENS = 'abc';

  assert.throws(() => resolveMaxOutputTokens(), /TRANSLATE_MAX_OUTPUT_TOKENS/);
});
