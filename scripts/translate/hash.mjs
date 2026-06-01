import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRANSLATOR_CONFIG_VERSION } from './config.mjs';
import { resolveModelConfig } from './model.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPT_PATH = join(__dirname, 'prompt.md');

let promptCache = null;
async function loadPromptOnce() {
  if (promptCache === null) promptCache = await readFile(PROMPT_PATH, 'utf-8');
  return promptCache;
}

/**
 * Cache key for a single (source file, target locale) pair.
 * Inputs that influence translation output must all flow into this hash, or
 * the cache will fail to invalidate when those inputs change.
 */
export async function computeSourceHash({ sourceContent, locale }) {
  const prompt = await loadPromptOnce();
  const h = createHash('sha256');
  h.update(`v${TRANSLATOR_CONFIG_VERSION}\n`);
  h.update(`${resolveModelConfig().modelId}\n`);
  h.update(`${locale}\n`);
  h.update(`${prompt.length}:${prompt}\n`);
  h.update(`${sourceContent.length}:${sourceContent}`);
  return h.digest('hex').slice(0, 16);
}
