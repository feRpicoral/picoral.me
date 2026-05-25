import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALE_NAMES, LOCALE_STYLE, TRANSLATOR_MODEL } from './config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, 'prompt.md');

let client = null;
function getClient() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Translation requires the env var; add it to your shell or .env.local for local runs.',
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

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

const TOOL = {
  name: 'submit_translations',
  description: 'Return the translated snippets in the same order, one entry per input.',
  input_schema: {
    type: 'object',
    properties: {
      translations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Same id as the input snippet.' },
            text: { type: 'string', description: 'Translated text.' },
          },
          required: ['id', 'text'],
          additionalProperties: false,
        },
      },
    },
    required: ['translations'],
    additionalProperties: false,
  },
};

function buildUserMessage(snippets, retryFeedback) {
  const lines = [];
  if (retryFeedback) {
    lines.push('Your previous attempt had these problems:');
    for (const issue of retryFeedback) lines.push(`- ${issue}`);
    lines.push('');
    lines.push('Retry. Same rules apply.');
    lines.push('');
  }
  lines.push('Translate these snippets. Call `submit_translations` with one entry per input.');
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
  const promptTemplate = await loadPrompt();
  const system = renderSystemPrompt(promptTemplate, locale);

  const response = await getClient().messages.create({
    model: TRANSLATOR_MODEL,
    max_tokens: 8192,
    temperature: 0,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: buildUserMessage(snippets, retryFeedback) }],
  });

  const toolUse = response.content.find((c) => c.type === 'tool_use' && c.name === TOOL.name);
  if (!toolUse) {
    throw new Error('Model did not call submit_translations tool.');
  }
  const translations = toolUse.input?.translations;
  if (!Array.isArray(translations)) {
    throw new Error('Tool input.translations is not an array.');
  }
  const byId = {};
  for (const entry of translations) {
    if (typeof entry?.id !== 'string' || typeof entry?.text !== 'string') {
      throw new Error('Translation entry missing id or text.');
    }
    byId[entry.id] = entry.text;
  }
  return byId;
}
