import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { TRANSLATOR_MODEL } from './config.mjs';
import { getLanguageModel, resolveModelConfig } from './model.mjs';

let savedModel;
let savedKey;

beforeEach(() => {
  savedModel = process.env.TRANSLATE_MODEL;
  savedKey = process.env.OPENROUTER_API_KEY;
});

afterEach(() => {
  process.env.TRANSLATE_MODEL = savedModel ?? '';
  process.env.OPENROUTER_API_KEY = savedKey ?? '';
});

test('resolveModelConfig falls back to the config default when TRANSLATE_MODEL is unset', () => {
  process.env.TRANSLATE_MODEL = '';

  assert.equal(resolveModelConfig().modelId, TRANSLATOR_MODEL);
});

test('resolveModelConfig honors the TRANSLATE_MODEL override', () => {
  process.env.TRANSLATE_MODEL = 'google/gemini-2.5-flash-lite';

  assert.equal(resolveModelConfig().modelId, 'google/gemini-2.5-flash-lite');
});

test('getLanguageModel throws a clear error when OPENROUTER_API_KEY is unset', () => {
  process.env.OPENROUTER_API_KEY = '';

  assert.throws(() => getLanguageModel(), /OPENROUTER_API_KEY/);
});
