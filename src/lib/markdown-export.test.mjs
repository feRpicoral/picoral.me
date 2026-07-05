import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mdxToMarkdown } from './markdown-export.mjs';

test('preserves headings, lists, links, and code', () => {
  const source = [
    '## What it does',
    '',
    'A line with **bold**, _italic_, and a [link](https://example.com).',
    '',
    '- one',
    '- two',
    '',
    '```ts',
    'const x = 1;',
    '```',
  ].join('\n');

  const out = mdxToMarkdown(source);

  assert.match(out, /## What it does/);
  assert.match(out, /\[link\]\(https:\/\/example\.com\)/);
  assert.match(out, /- one/);
  assert.match(out, /```ts\nconst x = 1;\n```/);
});

test('replaces ProjectImage with its caption as an italic line', () => {
  const source = [
    '## How it works',
    '',
    '<ProjectImage src="/src/assets/projects/desvia/route.png" alt="Alt description" caption="Two routes on offer." size="phone" />',
    '',
    'After the image.',
  ].join('\n');

  const out = mdxToMarkdown(source);

  assert.doesNotMatch(out, /ProjectImage/);
  assert.doesNotMatch(out, /src\/assets/);
  assert.match(out, /_Two routes on offer\._/);
  assert.match(out, /After the image\./);
});

test('falls back to alt text when a ProjectImage has no caption', () => {
  const source = '<ProjectImage src="/src/assets/x.png" alt="Just the alt" size="prose" />';

  const out = mdxToMarkdown(source);

  assert.match(out, /_Just the alt_/);
  assert.doesNotMatch(out, /ProjectImage/);
});

test('drops import/export statements', () => {
  const source = ["import Foo from '../Foo.astro';", '', '# Title', '', 'Body.'].join('\n');

  const out = mdxToMarkdown(source);

  assert.doesNotMatch(out, /import Foo/);
  assert.match(out, /# Title/);
  assert.match(out, /Body\./);
});

test('handles multiple images in sequence without leaking JSX', () => {
  const source = [
    '<ProjectImage src="/a.png" alt="A" caption="First." size="phone" />',
    '',
    '<ProjectImage src="/b.png" alt="B" caption="Second." size="phone" />',
  ].join('\n');

  const out = mdxToMarkdown(source);

  assert.match(out, /_First\._/);
  assert.match(out, /_Second\._/);
  assert.doesNotMatch(out, /<|ProjectImage/);
});

test('leaves plain markdown untouched', () => {
  const source = ['## Right now', '', 'I just graduated from **CU Boulder**.'].join('\n');

  const out = mdxToMarkdown(source);

  assert.equal(out, '## Right now\n\nI just graduated from **CU Boulder**.');
});
