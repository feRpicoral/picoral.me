import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { isEnabled } from '~/config/sections.ts';
import { SITE } from '~/config/site.ts';

// When the blog section is disabled we still render the feed once so the
// route never SSRs, but it carries no items. Combined with the Seo head-link
// gate, it stays unadvertised and acts as a graceful empty channel for any
// reader that probes the canonical /rss.xml path.
export const prerender = true;

const escapeXml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const GET: APIRoute = async () => {
  const posts = isEnabled('blog')
    ? (await getCollection('blog', ({ data, id }) => !data.draft && id.startsWith('en/'))).sort(
        (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
      )
    : [];

  const items = posts
    .map((post) => {
      const slug = post.id.replace(/^en\//, '');
      const url = `${SITE.url}/blog/${slug}`;
      return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${post.data.publishedAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-US</language>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
