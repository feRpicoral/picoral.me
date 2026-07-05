import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { sections } from './src/config/sections.ts';

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://picoral.me';
const enableKeystatic =
  process.env.NODE_ENV === 'development' || process.env.ENABLE_KEYSTATIC === 'true';

const isEnabled = (key) => sections[key].enabled;

const sitemapFilter = (page) => {
  const path = new URL(page).pathname;
  if (!isEnabled('blog') && /\/blog(\/|$)/.test(path)) return false;
  if (!isEnabled('now') && /\/now\/?$/.test(path)) return false;
  if (!isEnabled('uses') && /\/uses\/?$/.test(path)) return false;
  return true;
};

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  // The `.md` twins are English-only; appending `.md` to a localized URL resolves
  // to the English markdown rather than 404ing. The Vercel adapter emits these as
  // real redirects.
  redirects: {
    '/pt/[...slug].md': { status: 307, destination: '/[...slug].md' },
    '/es/[...slug].md': { status: 307, destination: '/[...slug].md' },
  },
  adapter: vercel({
    imageService: true,
  }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pt', 'es'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    react(),
    mdx(),
    ...(enableKeystatic ? [keystatic()] : []),
    sitemap({
      filter: sitemapFilter,
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', pt: 'pt-BR', es: 'es' },
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
  experimental: {
    contentIntellisense: true,
  },
});
