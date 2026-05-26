import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');

/**
 * Load `.env.local` then `.env` from the repo root via dotenv. Convention:
 * `.env.local` overrides `.env`; non-empty `process.env` values (real shell
 * exports) override both.
 *
 * Pre-pass: empty-string env values are deleted, so a stale `KEY=` line in
 * the user's shell config doesn't shadow a real value in `.env.local`. dotenv
 * by default treats an empty existing var as "already set" and skips it.
 */
export function loadEnvFiles() {
  for (const k of Object.keys(process.env)) {
    if (process.env[k] === '') delete process.env[k];
  }
  config({ path: join(REPO_ROOT, '.env.local'), quiet: true });
  config({ path: join(REPO_ROOT, '.env'), quiet: true });
}
