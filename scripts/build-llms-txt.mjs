#!/usr/bin/env node
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');

const SITE = {
  name: 'Fernando Picoral',
  url: process.env.PUBLIC_SITE_URL ?? 'https://picoral.me',
  description:
    'Brazilian software engineer based in New York. Software Engineer at Google (full-time from September 2026, after three summer internships). BS in Computer Science from CU Boulder, May 2026.',
};

const sections = (
  await import(join(repoRoot, 'src/config/sections.ts'), { with: { type: 'json' } }).catch(
    async () => {
      // Fallback for environments where TS import-with-json is unsupported: read & parse manually.
      const file = await readFile(join(repoRoot, 'src/config/sections.ts'), 'utf-8');
      const obj = {};
      const re = /(\w+):\s*\{\s*enabled:\s*(true|false)/g;
      for (;;) {
        const m = re.exec(file);
        if (m === null) break;
        obj[m[1]] = { enabled: m[2] === 'true' };
      }
      return { sections: obj };
    },
  )
).sections;

const enabled = (k) => sections[k]?.enabled !== false;

const PAGE_DESCRIPTIONS = {
  '/about': 'Background, current work, how I work, and tools I reach for.',
  '/experience':
    'Education and roles I have held — CU Boulder, Google (full-time + three internships), Trius, AnoniMe, MENV, BAIC Lab, Poatek, Stockvio.',
  '/contact': 'How to reach me.',
  '/projects': 'Personal side projects I have built or am building.',
};

const readFrontmatter = async (file) => {
  const txt = await readFile(file, 'utf-8');
  return matter(txt).data;
};

const isTrue = (value) => value === true || value === 'true';

const listMdxIn = async (dir) => {
  try {
    const items = await readdir(dir, { withFileTypes: true });
    return items
      .filter((d) => d.isFile() && /\.(md|mdx)$/.test(d.name))
      .map((d) => join(dir, d.name));
  } catch (_) {
    return [];
  }
};

const lines = [];
lines.push(`# ${SITE.name}`);
lines.push(`> ${SITE.description}`);
lines.push('');

lines.push('## Identity');
lines.push(`- [Home](${SITE.url}/): who I am and what I build`);
if (enabled('about')) lines.push(`- [About](${SITE.url}/about): ${PAGE_DESCRIPTIONS['/about']}`);
if (enabled('experience'))
  lines.push(`- [Experience](${SITE.url}/experience): ${PAGE_DESCRIPTIONS['/experience']}`);
if (enabled('contact'))
  lines.push(`- [Contact](${SITE.url}/contact): ${PAGE_DESCRIPTIONS['/contact']}`);
lines.push('');

if (enabled('projects')) {
  lines.push('## Projects');
  lines.push(`- [Projects index](${SITE.url}/projects): ${PAGE_DESCRIPTIONS['/projects']}`);
  const projectFiles = await listMdxIn(join(repoRoot, 'src/content/projects/en'));
  const projects = [];
  for (const file of projectFiles.sort()) {
    const fm = await readFrontmatter(file);
    if (isTrue(fm.draft)) continue;
    const slug = file.replace(/.*\//, '').replace(/\.(md|mdx)$/, '');
    projects.push({
      slug,
      title: fm.title,
      tagline: fm.tagline,
      hasCaseStudy: isTrue(fm.hasCaseStudy),
      featured: isTrue(fm.featured),
      order: Number(fm.order ?? '0'),
    });
  }
  projects.sort((a, b) => a.order - b.order);
  for (const p of projects) {
    if (!p.hasCaseStudy) continue;
    lines.push(`- [${p.title}](${SITE.url}/projects/${p.slug}): ${p.tagline}`);
  }
  lines.push('');
}

if (enabled('blog')) {
  lines.push('## Writing');
  const postFiles = await listMdxIn(join(repoRoot, 'src/content/blog/en'));
  for (const file of postFiles.sort().reverse()) {
    const fm = await readFrontmatter(file);
    if (isTrue(fm.draft)) continue;
    const slug = file.replace(/.*\//, '').replace(/\.(md|mdx)$/, '');
    lines.push(`- [${fm.title}](${SITE.url}/blog/${slug}): ${fm.description}`);
  }
  lines.push('');
}

const optional = [];
if (enabled('now')) optional.push(`- [Now](${SITE.url}/now): what I am focused on right now`);
if (enabled('uses')) optional.push(`- [Uses](${SITE.url}/uses): hardware and software I use daily`);
if (optional.length) {
  lines.push('## Optional');
  for (const l of optional) lines.push(l);
  lines.push('');
}

const out = `${lines.join('\n')}\n`;
const dest = join(repoRoot, 'public/llms.txt');
await writeFile(dest, out, 'utf-8');
console.log(`wrote ${relative(repoRoot, dest)} (${out.length} bytes)`);
