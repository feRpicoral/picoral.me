# picoral.me

Source code for **[picoral.me](https://picoral.me)** — the personal site of [Fernando Picoral](https://picoral.me/about), a Brazilian software engineer based in New York.

## What's on it

- Three locales: English (default), Portuguese (pt-BR), and Spanish (es)
- Pages: home, about, projects (with case studies for Sonar, Relay, Cite, and Recurra), experience timeline, contact
- Blog scaffolding (currently flag-disabled until the first post)
- All AEO-friendly: schema.org JSON-LD (`Person`, `WebSite`, `FAQPage`, `BreadcrumbList`, `SoftwareApplication`), per-locale `hreflang`, `llms.txt`, build-time OG images

## Stack

| Layer | Choice |
|---|---|
| Framework | [Astro 5](https://astro.build) (static output) |
| Adapter | [`@astrojs/vercel`](https://docs.astro.build/en/guides/integrations-guide/vercel/) |
| Islands | React 19 — only `ThemeToggle`, `LocaleSwitcher`, `MobileNav`, `CopyEmail`, `CommandPalette` |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config, OKLCH tokens) |
| Content | Astro Content Collections + MDX with Zod schemas |
| Fonts | Self-hosted via `@fontsource(-variable)/*` — Inter, Instrument Serif, JetBrains Mono |
| OG images | [`satori`](https://github.com/vercel/satori) + [`@resvg/resvg-js`](https://github.com/yisibl/resvg-js), built at static-generation time |
| Analytics | [Vercel Web Analytics](https://vercel.com/docs/analytics) + [Speed Insights](https://vercel.com/docs/speed-insights) |
| Lint / format | [Biome](https://biomejs.dev) |
| Package manager | [pnpm](https://pnpm.io) (Node 22) |
| Hosting | [Vercel](https://vercel.com), static output |

## Local development

```bash
pnpm install
pnpm dev               # http://localhost:4321
pnpm build             # static output to ./dist
pnpm preview           # serve the built output
pnpm lint              # biome check
pnpm translate         # regenerate stale pt/es translations from en/ sources
pnpm translate:check   # exit non-zero if any translation is stale (no API call)
```

`pnpm build` runs `translate:check` first (so stale translations fail the build with no network call), then regenerates `public/llms.txt`, then runs `astro build`.

Translation requires `ANTHROPIC_API_KEY` in the environment. CI only ever runs `--check`, so the key is needed locally, not on Vercel.

`pnpm translate` runs through a worker pool (default `--concurrency=4`) tuned for Anthropic's tier-1 output-tokens-per-minute limit on Sonnet 4.6. On higher tiers, pass `--concurrency=8` or more to go faster. The SDK retries 429s up to 5 times with exponential backoff; if a file still errors out, rerun `pnpm translate` and the cache will skip everything that succeeded and only retry the failed file in isolation.

## Architecture notes

### Section feature flags

`src/config/sections.ts` is the single source of truth for which top-level sections are enabled. Flipping a boolean removes the section from the nav, returns 404 on its routes, excludes it from the sitemap, removes it from `llms.txt`, and skips its RSS feed. Useful for hiding `/blog`, `/now`, `/uses` until there's content to put there.

### Email obfuscation

The email address is never written into server-rendered HTML. `src/config/site.ts` stores `emailUser` and `emailDomain` separately; every UI surface that displays or links to the address renders `<a data-email-user data-email-domain>` placeholders, and a small inline script in `src/layouts/Base.astro` wires up the `mailto:` href and visible text after the page hydrates. The `Person` JSON-LD intentionally omits the `email` field for the same reason.

### i18n and build-time translation

URLs are English-only across locales (`/about`, `/pt/about`, `/es/about`) for cleaner SEO and simpler routing. UI chrome strings live in `src/i18n/ui.ts`.

Content is authored in English only. Every `.md` / `.mdx` under `src/content/<collection>/en/` is the canonical source. `scripts/translate-content.mjs` generates the `pt/` and `es/` siblings at edit time via the Anthropic API, committed alongside the English source.

Each translated file carries a `_source` block in its frontmatter:

```yaml
_source:
  hash: '7a91f3d2c0b8e145'
  locale: en
  translatedAt: '2026-05-25T18:00:00Z'
  # locked: true   # uncomment to skip regeneration after a manual edit
```

The hash is `sha256(source bytes + prompt template + model + locale + config version)`, truncated to 16 hex chars. On each run, the script recomputes that hash and skips the file when it matches. Set `locked: true` after hand-editing a translation to opt out of future regeneration (a warning prints if the source drifts).

Workflow:

1. Edit `src/content/<collection>/en/<slug>.{md,mdx}`.
2. Run `pnpm translate` locally. It calls the API only for files whose hash drifted.
3. Commit the English edit and the regenerated `pt/`/`es/` files together.
4. CI runs `pnpm translate:check` as part of `pnpm build` and fails if anything is stale.

Per-collection translatable-field allowlists live in `scripts/translate/handlers.mjs`. Body translation is AST-aware: code blocks, MDX JSX, and ESM imports are left untouched. Bump `TRANSLATOR_CONFIG_VERSION` in `scripts/translate/config.mjs` to invalidate every cached translation at once (e.g., after changing the prompt or model).

### Email + analytics scripts

The analytics + speed-insights scripts ship via `<Analytics />` and `<SpeedInsights />` from `@vercel/analytics/astro` and `@vercel/speed-insights/astro` respectively, mounted in `Base.astro`. Both survive Astro's View Transitions out of the box.

## License

Source is public for transparency, not as a template. Feel free to read it and crib ideas; please don't redeploy it verbatim as your own site.
