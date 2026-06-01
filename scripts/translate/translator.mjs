import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NoObjectGeneratedError, generateObject } from 'ai';
import { z } from 'zod';
import { LOCALE_NAMES, LOCALE_STYLE } from './config.mjs';
import { getLanguageModel } from './model.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, 'prompt.md');

let promptCache = null;
async function loadPrompt() {
  if (promptCache === null) promptCache = await readFile(PROMPT_PATH, 'utf-8');
  return promptCache;
}

function renderSystemPrompt(template, locale) {
  return template
    .replaceAll('{{LOCALE_NAME}}', LOCALE_NAMES[locale])
    .replaceAll('{{LOCALE_STYLE}}', LOCALE_STYLE[locale]);
}

const TRANSLATIONS_SCHEMA = z.object({
  translations: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
});

function buildUserMessage(snippets, retryFeedback) {
  const lines = [];
  if (retryFeedback) {
    lines.push('Your previous attempt had these problems:');
    for (const issue of retryFeedback) lines.push(`- ${issue}`);
    lines.push('');
    lines.push('Retry. Same rules apply.');
    lines.push('');
  }
  lines.push('Translate these snippets. Return one entry per input, keeping each id unchanged.');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(snippets, null, 2));
  lines.push('```');
  return lines.join('\n');
}

/**
 * Send snippets to the model and return a `{ id → translated text }` map.
 * Optionally provides retry feedback to nudge the model on a follow-up attempt.
 */
export async function translateSnippets({ locale, snippets, retryFeedback }) {
  if (snippets.length === 0) return {};
  const system = renderSystemPrompt(await loadPrompt(), locale);

  let object;
  try {
    ({ object } = await generateObject({
      model: getLanguageModel(),
      schema: TRANSLATIONS_SCHEMA,
      system,
      prompt: buildUserMessage(snippets, retryFeedback),
      temperature: 0,
      maxOutputTokens: 4096,
      // SDK default is 2; 5 buys headroom for provider rate-limit backoff.
      maxRetries: 5,
    }));
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      throw new Error(`Model did not return a valid translations object: ${err.message}`);
    }
    throw err;
  }

  const byId = {};
  for (const { id, text } of object.translations) byId[id] = text;
  return byId;
}
