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
pnpm dev          # http://localhost:4321
pnpm build        # static output to ./dist
pnpm preview      # serve the built output
pnpm lint         # biome check
```

`pnpm build` also runs `scripts/build-llms-txt.mjs` first to regenerate `public/llms.txt` from the content collections and section flags.

## Architecture notes

### Section feature flags

`src/config/sections.ts` is the single source of truth for which top-level sections are enabled. Flipping a boolean removes the section from the nav, returns 404 on its routes, excludes it from the sitemap, removes it from `llms.txt`, and skips its RSS feed. Useful for hiding `/blog`, `/now`, `/uses` until there's content to put there.

### Email obfuscation

The email address is never written into server-rendered HTML. `src/config/site.ts` stores `emailUser` and `emailDomain` separately; every UI surface that displays or links to the address renders `<a data-email-user data-email-domain>` placeholders, and a small inline script in `src/layouts/Base.astro` wires up the `mailto:` href and visible text after the page hydrates. The `Person` JSON-LD intentionally omits the `email` field for the same reason.

### i18n

URLs are English-only across locales (`/about`, `/pt/about`, `/es/about`) for cleaner SEO and simpler routing. Content collections are organized by locale (`src/content/<collection>/<locale>/<slug>.mdx`), with a helper in `src/lib/content.ts` that falls back to the English entry plus a "translation missing" banner when a locale variant doesn't exist. UI chrome strings live in `src/i18n/ui.ts`.

### Email + analytics scripts

The analytics + speed-insights scripts ship via `<Analytics />` and `<SpeedInsights />` from `@vercel/analytics/astro` and `@vercel/speed-insights/astro` respectively, mounted in `Base.astro`. Both survive Astro's View Transitions out of the box.

## License

Source is public for transparency, not as a template. Feel free to read it and crib ideas; please don't redeploy it verbatim as your own site.
