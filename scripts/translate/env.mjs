import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

/**
 * Minimal `.env` loader. Mirrors the convention `.env.local` overrides `.env`.
 * Loads `.env.local` first (first writer wins), then `.env` for any keys not
 * already set. Non-empty `process.env` values take precedence over both, so
 * a shell export still wins — but an *empty* shell value (e.g. an old
 * `ANTHROPIC_API_KEY=` left in `.zshrc`) is treated as absent and overridden
 * by the file. Empty env values are practically always mistakes.
 *
 * Only KEY=value lines, with optional surrounding single or double quotes,
 * are recognized. Comments (`#`) and blank lines are skipped.
 */
function parseEnvFile(content) {
  const out = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    if (!key) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function loadFileInto(env, path) {
  let content;
  try {
    content = readFileSync(path, 'utf-8');
  } catch (e) {
    if (e.code === 'ENOENT') return;
    throw e;
  }
  const parsed = parseEnvFile(content);
  for (const [k, v] of Object.entries(parsed)) {
    const current = env[k];
    if (current === undefined || current === '') env[k] = v;
  }
}

export function loadEnvFiles() {
  loadFileInto(process.env, join(REPO_ROOT, '.env.local'));
  loadFileInto(process.env, join(REPO_ROOT, '.env'));
}
