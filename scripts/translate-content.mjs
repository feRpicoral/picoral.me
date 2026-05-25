#!/usr/bin/env node
/**
 * Build-time content translator.
 *
 * Reads English source files under `src/content/<collection>/en/` and writes
 * locale translations under `src/content/<collection>/<locale>/` for each
 * locale in TARGET_LOCALES.
 *
 * The translated file carries a `_source.hash` frontmatter marker that is the
 * cache key (sha256 of source bytes + prompt + model + locale + config version).
 * On rerun, files whose hash already matches are skipped. Files marked
 * `_source.locked: true` are skipped even on hash mismatch (a warning is
 * printed so you know the manual override has drifted from source).
 *
 * Modes:
 *   pnpm translate            — translate stale/missing files, write to disk.
 *   pnpm translate --check    — exit non-zero if anything is stale or missing.
 *                                Never calls the API.
 *   pnpm translate --force    — regenerate everything, ignoring cache hits.
 *   pnpm translate --collection=blog --locale=pt
 *                             — narrow scope.
 *
 * CI should run `--check` only.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { translateSnippets } from './translate/anthropic.mjs';
import { COLLECTIONS, SOURCE_LOCALE, TARGET_LOCALES } from './translate/config.mjs';
import { loadEnvFiles } from './translate/env.mjs';
import { getHandler } from './translate/handlers.mjs';
import { computeSourceHash } from './translate/hash.mjs';
import {
  extractBodySnippets,
  injectBodyTranslations,
  parseMdx,
  serializeMdx,
  structuralFingerprint,
} from './translate/mdx.mjs';
import { compareStructuralFingerprints, validateTranslations } from './translate/validate.mjs';

// Imported modules read process.env lazily inside their functions, so populating
// process.env here (after all imports finish hoisting) is sufficient.
loadEnvFiles();

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const CONTENT_DIR = join(REPO_ROOT, 'src', 'content');

/**
 * Picked to fit Anthropic tier-1 output-tokens-per-minute (~8k for Sonnet 4.6).
 * At avg ~2k output tokens per file × 4 concurrent ≈ 8k, sitting at the limit
 * but rarely tripping it. Bump via `--concurrency=N` once on a higher tier.
 */
const DEFAULT_CONCURRENCY = 4;

function parseArgs(argv) {
  const args = {
    check: false,
    force: false,
    concurrency: DEFAULT_CONCURRENCY,
    collections: COLLECTIONS,
    locales: TARGET_LOCALES,
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--check') args.check = true;
    else if (arg === '--force') args.force = true;
    else if (arg.startsWith('--collection=')) {
      args.collections = arg.slice('--collection='.length).split(',');
    } else if (arg.startsWith('--locale=')) {
      args.locales = arg.slice('--locale='.length).split(',');
    } else if (arg.startsWith('--concurrency=')) {
      const n = Number.parseInt(arg.slice('--concurrency='.length), 10);
      if (!Number.isInteger(n) || n < 1) {
        throw new Error(`Invalid --concurrency value: must be a positive integer.`);
      }
      args.concurrency = n;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: translate-content.mjs [--check] [--force] [--collection=a,b] [--locale=pt,es] [--concurrency=N]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown arg: ${arg}`);
    }
  }
  return args;
}

/**
 * Run async `fn` over `items` with at most `limit` calls in flight at once.
 * Tasks consume from a shared cursor — no chunking, so a slow task never blocks
 * faster siblings. Errors from `fn` should be caught inside `fn`; an uncaught
 * throw will reject one worker but leave the rest running until the cursor is
 * exhausted, then `Promise.all` will reject.
 */
async function runPool(items, limit, fn) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

async function listSourceFiles(collection) {
  const dir = join(CONTENT_DIR, collection, SOURCE_LOCALE);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
  return entries
    .filter((e) => e.isFile() && /\.(md|mdx)$/.test(e.name))
    .map((e) => join(dir, e.name));
}

async function readExistingTarget(targetPath) {
  try {
    const raw = await readFile(targetPath, 'utf-8');
    return matter(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

async function translateOneFile({ collection, sourceRaw, locale, expectedHash }) {
  const parsed = matter(sourceRaw);
  const handler = getHandler(collection);

  const fmSnippets = handler.extract(parsed.data);
  const tree = parseMdx(parsed.content);
  const sourceFingerprint = structuralFingerprint(tree);
  const { snippets: bodySnippets, leaves } = extractBodySnippets(tree);
  const allSnippets = [...fmSnippets, ...bodySnippets];

  let byId = await translateSnippets({ locale, snippets: allSnippets });
  let issues = validateTranslations({ snippets: allSnippets, byId });
  if (issues.length > 0) {
    byId = await translateSnippets({ locale, snippets: allSnippets, retryFeedback: issues });
    issues = validateTranslations({ snippets: allSnippets, byId });
    if (issues.length > 0) {
      throw new Error(`Validation failed after retry:\n  - ${issues.join('\n  - ')}`);
    }
  }

  injectBodyTranslations(leaves, byId);

  const translatedFingerprint = structuralFingerprint(tree);
  const structIssues = compareStructuralFingerprints(sourceFingerprint, translatedFingerprint);
  if (structIssues.length > 0) {
    throw new Error(`Structural drift after translation:\n  - ${structIssues.join('\n  - ')}`);
  }

  const fmOnly = {};
  for (const [k, v] of Object.entries(byId)) {
    if (k.startsWith('fm:')) fmOnly[k] = v;
  }
  const translatedData = handler.inject(parsed.data, fmOnly);
  translatedData._source = {
    hash: expectedHash,
    locale: SOURCE_LOCALE,
    translatedAt: new Date().toISOString(),
  };
  for (const k of Object.keys(translatedData)) {
    if (translatedData[k] === undefined) delete translatedData[k];
  }

  const translatedBody = serializeMdx(tree);
  return matter.stringify(translatedBody, translatedData);
}

async function processOne({ collection, sourcePath, locale, check, force }) {
  const filename = sourcePath.split('/').pop();
  const targetPath = join(CONTENT_DIR, collection, locale, filename);
  const sourceRaw = await readFile(sourcePath, 'utf-8');
  const expectedHash = await computeSourceHash({ sourceContent: sourceRaw, locale });
  const existing = await readExistingTarget(targetPath);
  const existingHash = existing?.data?._source?.hash;
  const locked = existing?.data?._source?.locked === true;

  if (locked && existing) {
    if (existingHash !== expectedHash) {
      return {
        status: 'locked-stale',
        targetPath,
        message: `Source changed but translation is locked (expected hash ${expectedHash}, file has ${existingHash || 'none'}). Edit by hand or remove _source.locked.`,
      };
    }
    return { status: 'fresh', targetPath };
  }

  if (!force && existingHash === expectedHash) {
    return { status: 'fresh', targetPath };
  }

  if (check) {
    return {
      status: 'stale',
      targetPath,
      message: existing
        ? `Hash mismatch (expected ${expectedHash}, file has ${existingHash || 'none'}).`
        : 'Translation file missing.',
    };
  }

  await mkdir(dirname(targetPath), { recursive: true });
  const rendered = await translateOneFile({ collection, sourceRaw, locale, expectedHash });
  await writeFile(targetPath, rendered, 'utf-8');
  return { status: 'translated', targetPath };
}

async function main() {
  const args = parseArgs(process.argv);

  console.log(
    `${args.check ? 'Checking' : 'Translating'} collections=[${args.collections.join(',')}] locales=[${args.locales.join(',')}] concurrency=${args.concurrency}`,
  );

  const tasks = [];
  for (const collection of args.collections) {
    const sources = await listSourceFiles(collection);
    for (const sourcePath of sources) {
      for (const locale of args.locales) {
        tasks.push({ collection, sourcePath, locale });
      }
    }
  }

  const results = [];
  await runPool(tasks, args.concurrency, async ({ collection, sourcePath, locale }) => {
    const rel = relative(REPO_ROOT, sourcePath);
    try {
      const r = await processOne({
        collection,
        sourcePath,
        locale,
        check: args.check,
        force: args.force,
      });
      results.push({ collection, sourcePath, locale, ...r });
      if (r.status === 'stale') {
        console.error(`  stale   ${locale}  ${rel}  — ${r.message}`);
      } else if (r.status === 'locked-stale') {
        console.warn(`  locked  ${locale}  ${rel}  — ${r.message}`);
      } else if (r.status === 'translated') {
        console.log(`  wrote   ${locale}  ${rel}`);
      }
    } catch (e) {
      results.push({ collection, sourcePath, locale, status: 'error', error: e });
      console.error(`  error   ${locale}  ${rel}`);
      console.error(`          ${e.message}`);
    }
  });

  const stale = results.filter((r) => r.status === 'stale').length;
  const errors = results.filter((r) => r.status === 'error').length;
  const wrote = results.filter((r) => r.status === 'translated').length;
  const fresh = results.filter((r) => r.status === 'fresh').length;
  const lockedStale = results.filter((r) => r.status === 'locked-stale').length;

  if (args.check) {
    console.log(
      `\nFresh: ${fresh}. Stale: ${stale}. Locked-stale: ${lockedStale}. Errors: ${errors}.`,
    );
    if (stale > 0) {
      console.error('Run `pnpm translate` to regenerate stale translations.');
      process.exit(1);
    }
    if (errors > 0) process.exit(1);
    return;
  }

  console.log(`\nWrote: ${wrote}. Fresh (skipped): ${fresh}. Locked-stale: ${lockedStale}. Errors: ${errors}.`);
  if (errors > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});
