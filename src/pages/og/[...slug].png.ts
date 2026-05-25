import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { SITE } from '~/config/site.ts';
import { getCanonicalSlug } from '~/lib/content.ts';

export const prerender = true;

type Entry = {
  slug: string;
  title: string;
  subtitle: string;
};

export async function getStaticPaths() {
  const result: Array<{ params: { slug: string }; props: Entry }> = [];

  result.push({
    params: { slug: 'default' },
    props: {
      slug: 'default',
      title: SITE.name,
      subtitle: SITE.description,
    },
  });

  const pages: Array<{ slug: string; title: string; subtitle: string }> = [
    { slug: 'home', title: SITE.name, subtitle: SITE.description },
    { slug: 'about', title: 'About', subtitle: `About ${SITE.name}` },
    { slug: 'projects', title: 'Projects', subtitle: `Things ${SITE.name} has built and is building` },
    { slug: 'experience', title: 'Experience', subtitle: `Where ${SITE.name} has worked` },
    { slug: 'contact', title: 'Contact', subtitle: `Get in touch with ${SITE.name}` },
  ];
  for (const p of pages) {
    result.push({ params: { slug: p.slug }, props: p });
  }

  const projects = await getCollection('projects', ({ data }) => !data.draft);
  const seen = new Set<string>();
  for (const entry of projects) {
    if (!entry.id.startsWith('en/')) continue;
    const slug = getCanonicalSlug(entry.id);
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push({
      params: { slug: `projects/${slug}` },
      props: { slug, title: entry.data.title, subtitle: entry.data.tagline },
    });
  }

  return result;
}

const loadFont = async (relPath: string): Promise<ArrayBuffer> => {
  const url = new URL(relPath, import.meta.url);
  const buf = await readFile(url);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
};

const interRegularP = loadFont('../../../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff');
const interBoldP = loadFont('../../../node_modules/@fontsource/inter/files/inter-latin-600-normal.woff');
const serifItalicP = loadFont('../../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff');

export const GET: APIRoute<Entry> = async ({ props }) => {
  const { title, subtitle } = props;

  const [interRegular, interBold, serifItalic] = await Promise.all([
    interRegularP,
    interBoldP,
    serifItalicP,
  ]);

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#fafaf9',
          fontFamily: 'Inter',
          position: 'relative',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '12px',
                background: '#3b82f6',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '20px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#737280',
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      marginBottom: '24px',
                    },
                    children: 'picoral.me',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 24 ? '76px' : '96px',
                      fontFamily: 'Instrument Serif',
                      fontStyle: 'italic',
                      lineHeight: 1.05,
                      letterSpacing: '-0.02em',
                      color: '#1f2233',
                      marginBottom: '32px',
                      maxWidth: '950px',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '28px',
                      lineHeight: 1.4,
                      color: '#52525b',
                      maxWidth: '900px',
                      fontFamily: 'Inter',
                    },
                    children: subtitle.length > 180 ? `${subtitle.slice(0, 180)}…` : subtitle,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontFamily: 'Inter',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 600,
                      color: '#1f2233',
                    },
                    children: 'Fernando Picoral',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '18px',
                      color: '#737280',
                    },
                    children: 'SWE Intern @ Google · CU Boulder \'26 · NYC',
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interBold, weight: 600, style: 'normal' },
        { name: 'Instrument Serif', data: serifItalic, weight: 400, style: 'italic' },
      ],
    },
  );

  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  }).render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
