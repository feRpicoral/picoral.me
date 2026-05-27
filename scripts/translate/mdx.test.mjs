import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  extractBodySnippets,
  injectBodyTranslations,
  localizeInternalLinks,
  parseMdx,
  serializeMdx,
  structuralFingerprint,
} from './mdx.mjs';

const ALL_LOCALES = ['en', 'pt', 'es'];

test('extractBodySnippets returns one snippet per paragraph', () => {
  const tree = parseMdx('First paragraph.\n\nSecond paragraph.\n');

  const { snippets } = extractBodySnippets(tree);

  assert.equal(snippets.length, 2);
  assert.deepEqual(
    snippets.map((s) => s.text),
    ['First paragraph.', 'Second paragraph.'],
  );
  for (const s of snippets) assert.equal(s.kind, 'body:paragraph');
});

test('extractBodySnippets captures headings', () => {
  const tree = parseMdx('# Top\n\n## Sub\n\nPara.');

  const { snippets } = extractBodySnippets(tree);

  assert.equal(snippets.length, 3);
  assert.equal(snippets[0].kind, 'body:heading');
  assert.equal(snippets[0].text, 'Top');
  assert.equal(snippets[1].kind, 'body:heading');
  assert.equal(snippets[1].text, 'Sub');
});

test('extractBodySnippets skips fenced code blocks', () => {
  const src = 'Before.\n\n```ts\nconst x: number = 1;\n```\n\nAfter.';
  const tree = parseMdx(src);

  const { snippets } = extractBodySnippets(tree);

  assert.deepEqual(
    snippets.map((s) => s.text),
    ['Before.', 'After.'],
  );
});

test('extractBodySnippets descends into list items', () => {
  const tree = parseMdx('- One item\n- Two item\n- Three\n');

  const { snippets } = extractBodySnippets(tree);

  assert.equal(snippets.length, 3);
  assert.deepEqual(
    snippets.map((s) => s.text),
    ['One item', 'Two item', 'Three'],
  );
});

test('extractBodySnippets descends into blockquotes', () => {
  const tree = parseMdx('> Quoted line.\n');

  const { snippets } = extractBodySnippets(tree);

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].text, 'Quoted line.');
});

test('extractBodySnippets skips MDX JSX flow elements', () => {
  const src = 'Before.\n\n<Image src="x.png" alt="y" />\n\nAfter.';
  const tree = parseMdx(src);

  const { snippets } = extractBodySnippets(tree);

  assert.deepEqual(
    snippets.map((s) => s.text),
    ['Before.', 'After.'],
  );
});

test('extractBodySnippets skips MDX ESM imports', () => {
  const src = "import foo from './foo';\n\nBody paragraph.\n";
  const tree = parseMdx(src);

  const { snippets } = extractBodySnippets(tree);

  assert.equal(snippets.length, 1);
  assert.equal(snippets[0].text, 'Body paragraph.');
});

test('extractBodySnippets returns leaves in document order', () => {
  const tree = parseMdx('# H1\n\nPara 1.\n\n- list\n\n## H2\n\nPara 2.');

  const { snippets, leaves } = extractBodySnippets(tree);

  assert.equal(snippets.length, leaves.length);
  assert.equal(snippets.length, 5);
});

test('injectBodyTranslations swaps children of leaf blocks', () => {
  const tree = parseMdx('Hello world.\n');
  const { snippets, leaves } = extractBodySnippets(tree);

  injectBodyTranslations(leaves, { [snippets[0].id]: 'Olá mundo.' });

  const out = serializeMdx(tree).trim();
  assert.equal(out, 'Olá mundo.');
});

test('injectBodyTranslations throws when translation parses as multiple blocks', () => {
  const tree = parseMdx('Original.');
  const { leaves } = extractBodySnippets(tree);

  assert.throws(
    () => injectBodyTranslations(leaves, { 'body:0': 'First.\n\nSecond.' }),
    /single block/,
  );
});

test('injectBodyTranslations throws when a translation is missing', () => {
  const tree = parseMdx('A.\n\nB.');
  const { leaves } = extractBodySnippets(tree);

  assert.throws(() => injectBodyTranslations(leaves, { 'body:0': 'A traduzido' }), /Missing/);
});

test('structuralFingerprint counts leaf blocks and code blocks', () => {
  const tree = parseMdx('# Heading\n\nPara.\n\n```js\ncode\n```\n');

  const fp = structuralFingerprint(tree);

  assert.equal(fp.leafBlocks, 2);
  assert.equal(fp.codeBlocks, 1);
});

test('structuralFingerprint counts inline code, links, and images', () => {
  const tree = parseMdx('Has `inline` and [a link](http://x) and ![](img.png).');

  const fp = structuralFingerprint(tree);

  assert.equal(fp.inlineCode, 1);
  assert.equal(fp.links, 1);
  assert.equal(fp.images, 1);
});

test('structuralFingerprint counts MDX JSX and ESM nodes', () => {
  const src = "import x from './x';\n\n<Foo bar='baz' />\n\nPara with <Inline />.";
  const tree = parseMdx(src);

  const fp = structuralFingerprint(tree);

  assert.equal(fp.mdxjsEsm, 1);
  assert.equal(fp.mdxJsxFlow, 1);
  assert.equal(fp.mdxJsxText, 1);
});

test('localizeInternalLinks prefixes site-internal hrefs for non-default locales', () => {
  const tree = parseMdx('See [projects](/projects) and [contact](/contact).');

  localizeInternalLinks(tree, 'pt', 'en', ALL_LOCALES);

  const out = serializeMdx(tree).trim();
  assert.equal(out, 'See [projects](/pt/projects) and [contact](/pt/contact).');
});

test('localizeInternalLinks is a no-op for the default locale', () => {
  const tree = parseMdx('See [projects](/projects).');

  localizeInternalLinks(tree, 'en', 'en', ALL_LOCALES);

  assert.equal(serializeMdx(tree).trim(), 'See [projects](/projects).');
});

test('localizeInternalLinks leaves external, mailto, tel, and anchor URLs alone', () => {
  const src =
    'A [external](https://example.com), [protocol-relative](//cdn.x.com/a), ' +
    '[mailto](mailto:a@b.com), [tel](tel:+1234567890), and [anchor](#foo).';
  const tree = parseMdx(src);

  localizeInternalLinks(tree, 'pt', 'en', ALL_LOCALES);

  const out = serializeMdx(tree).trim();
  assert.ok(out.includes('(https://example.com)'));
  assert.ok(out.includes('(//cdn.x.com/a)'));
  assert.ok(out.includes('(mailto:a@b.com)'));
  assert.ok(out.includes('(tel:+1234567890)'));
  assert.ok(out.includes('(#foo)'));
});

test('localizeInternalLinks does not double-prefix an already-prefixed path', () => {
  const tree = parseMdx('See [contact](/pt/contact).');

  localizeInternalLinks(tree, 'pt', 'en', ALL_LOCALES);

  assert.equal(serializeMdx(tree).trim(), 'See [contact](/pt/contact).');
});

test('identity inject preserves structural fingerprint', () => {
  const src = 'A para with **bold**, `code`, and [a link](http://x).';
  const tree = parseMdx(src);
  const before = structuralFingerprint(tree);
  const { snippets, leaves } = extractBodySnippets(tree);

  injectBodyTranslations(leaves, Object.fromEntries(snippets.map((s) => [s.id, s.text])));

  const after = structuralFingerprint(tree);
  assert.deepEqual(before, after);
});
