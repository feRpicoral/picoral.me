import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import { sections } from './src/config/sections.ts';

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://picoral.me';

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
    icon({ include: { lucide: ['*'] } }),
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
