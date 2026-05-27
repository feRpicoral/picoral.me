# Agent instructions

Conventions for AI coding agents working in this repo.

## Translations are LLM-generated via the build script — never hand-write them

Content under `src/content/{blog,projects,experience,pages}/` is authored in English under the `en/` subdirectory. The `pt/` and `es/` siblings are **generated** by `scripts/translate-content.mjs`, which calls Anthropic, writes a `_source.hash` frontmatter marker, and validates structural fingerprints. CI runs `pnpm translate:check` and fails if anything is stale or missing.

**Workflow when adding or editing localized content:**

1. Author or edit the file under `src/content/<collection>/en/`.
2. Run `pnpm translate` to regenerate the `pt/` and `es/` siblings.
3. Commit the `en/` source together with the regenerated `pt/` and `es/` files in the same commit.

**Do not:**

- Hand-write `pt/` or `es/` files. They won't have the right `_source.hash` and CI will fail.
- Edit a generated file directly to "fix a translation." Either fix the English source and re-run the script, or — if you need a manual override that survives source edits — set `_source.locked: true` in the translated file's frontmatter (the script will skip it and warn on drift).
- Commit `en/` changes without the regenerated translations. The build (`pnpm build`) runs `--check` mode and will fail.

**Schema watch-out:** `seo.description` is capped at 220 chars. The Spanish translation usually runs ~20% longer than English, so keep the English source under ~180 chars or `pnpm translate` will fail validation.

**Other modes:**

- `pnpm translate --check` — fail if stale, never call the API. Use in CI.
- `pnpm translate --force` — regenerate everything, ignoring the hash cache.
- `pnpm translate --collection=blog --locale=pt` — narrow scope.
