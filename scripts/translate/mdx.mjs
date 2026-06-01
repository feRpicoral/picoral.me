import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

/**
 * Treat these as leaf blocks containing translatable phrasing content.
 * Their children are serialized as a single markdown snippet and replaced
 * after translation.
 */
const LEAF_BLOCKS = new Set(['paragraph', 'heading', 'tableCell']);

/**
 * Containers whose children may include translatable blocks. We descend into
 * these without translating the container itself.
 */
const CONTAINER_BLOCKS = new Set([
  'root',
  'blockquote',
  'list',
  'listItem',
  'table',
  'tableRow',
  'footnoteDefinition',
]);
const TRANSLATABLE_MDX_ATTRIBUTES = new Map([['ProjectImage', new Set(['alt', 'caption'])]]);

const fullProcessor = () =>
  unified().use(remarkParse).use(remarkFrontmatter, ['yaml']).use(remarkMdx).use(remarkStringify, {
    bullet: '-',
    emphasis: '_',
    strong: '*',
    fence: '`',
    fences: true,
    listItemIndent: 'one',
    rule: '-',
  });

const phrasingWriter = () =>
  unified()
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '_',
      strong: '*',
      fence: '`',
      fences: true,
    })
    .use(remarkMdx);

const phrasingReader = () => unified().use(remarkParse).use(remarkMdx);

export function parseMdx(source) {
  return fullProcessor().parse(source);
}

export function serializeMdx(tree) {
  return fullProcessor().stringify(tree);
}

/**
 * Walk the tree and yield each translatable leaf block in document order.
 * Skips code blocks, raw HTML, MDX JSX elements, and MDX ESM imports entirely.
 */
function* iterateLeaves(node) {
  if (LEAF_BLOCKS.has(node.type)) {
    yield node;
    return;
  }
  if (CONTAINER_BLOCKS.has(node.type)) {
    for (const child of node.children ?? []) {
      yield* iterateLeaves(child);
    }
  }
}

function* iterateMdxAttributes(node) {
  if (
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    typeof node.name === 'string'
  ) {
    const translatable = TRANSLATABLE_MDX_ATTRIBUTES.get(node.name);
    if (translatable) {
      for (const attr of node.attributes ?? []) {
        if (
          attr.type === 'mdxJsxAttribute' &&
          translatable.has(attr.name) &&
          typeof attr.value === 'string' &&
          attr.value.trim()
        ) {
          yield { node, nodeName: node.name, attr };
        }
      }
    }
  }
  for (const child of node.children ?? []) {
    yield* iterateMdxAttributes(child);
  }
}

function serializePhrasing(children) {
  const writer = phrasingWriter();
  const fake = { type: 'paragraph', children };
  return writer.stringify(fake).trim();
}

function parsePhrasing(text) {
  const tree = phrasingReader().parse(text);
  if (tree.children.length !== 1) {
    throw new Error(
      `Translated snippet did not parse as a single block (got ${tree.children.length} blocks): ${text.slice(0, 80)}…`,
    );
  }
  const block = tree.children[0];
  if (block.type !== 'paragraph') {
    throw new Error(
      `Translated snippet not a paragraph (got ${block.type}): ${text.slice(0, 80)}…`,
    );
  }
  return block.children;
}

/**
 * Extract translatable body snippets from an MDX tree.
 * Returns ordered snippets plus an ordered list of leaf-block references for
 * later in-place mutation.
 */
export function extractBodySnippets(tree) {
  const snippets = [];
  const leaves = [];
  const mdxAttributes = [];
  let i = 0;
  for (const node of iterateLeaves(tree)) {
    const text = serializePhrasing(node.children ?? []);
    if (!text.trim()) {
      // Empty paragraph (e.g., from stray whitespace) — leave alone.
      continue;
    }
    snippets.push({
      id: `body:${i}`,
      kind: `body:${node.type}`,
      text,
    });
    leaves.push(node);
    i += 1;
  }
  const nextComponentIndexes = new Map();
  const seenComponents = new WeakMap();
  for (const { node, nodeName, attr } of iterateMdxAttributes(tree)) {
    let componentIndex = seenComponents.get(node);
    if (componentIndex === undefined) {
      componentIndex = nextComponentIndexes.get(nodeName) ?? 0;
      seenComponents.set(node, componentIndex);
      nextComponentIndexes.set(nodeName, componentIndex + 1);
    }
    const id = `mdx:${nodeName}[${componentIndex}].${attr.name}`;
    snippets.push({
      id,
      kind: `mdx:${nodeName}.${attr.name}`,
      text: attr.value,
    });
    mdxAttributes.push({ id, attr });
  }
  return { snippets, leaves, mdxAttributes };
}

/**
 * Walk a tree and rewrite internal `link` href values so they carry the
 * target locale prefix. URLs starting with `http(s)://`, `//`, `mailto:`,
 * `tel:`, `#`, or an existing locale prefix are left untouched. Only used
 * for non-default locales; passing the default locale is a no-op.
 */
export function localizeInternalLinks(tree, locale, defaultLocale, allLocales) {
  if (locale === defaultLocale) return;
  const localePrefixes = new Set(allLocales.map((l) => `/${l}`));
  const walk = (node) => {
    if (node.type === 'link' && typeof node.url === 'string') {
      const url = node.url;
      if (
        url.startsWith('/') &&
        !url.startsWith('//') &&
        ![...localePrefixes].some((p) => url === p || url.startsWith(`${p}/`))
      ) {
        node.url = `/${locale}${url === '/' ? '' : url}`;
      }
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
}

/**
 * Mutate the tree in place by replacing leaf children with translated phrasing.
 */
export function injectBodyTranslations(leaves, byId, mdxAttributes = []) {
  leaves.forEach((node, i) => {
    const translated = byId[`body:${i}`];
    if (translated === undefined) {
      throw new Error(`Missing translation for body:${i}`);
    }
    node.children = parsePhrasing(translated);
  });
  for (const { id, attr } of mdxAttributes) {
    const translated = byId[id];
    if (translated === undefined) {
      throw new Error(`Missing translation for ${id}`);
    }
    attr.value = translated;
  }
}

/**
 * Count structural elements in the tree that must survive translation
 * unchanged. Used by the validator after writing the translated file.
 */
export function structuralFingerprint(tree) {
  const counts = {
    leafBlocks: 0,
    codeBlocks: 0,
    inlineCode: 0,
    mdxJsxFlow: 0,
    mdxJsxText: 0,
    mdxjsEsm: 0,
    links: 0,
    images: 0,
  };
  const walk = (node) => {
    if (LEAF_BLOCKS.has(node.type)) counts.leafBlocks += 1;
    if (node.type === 'code') counts.codeBlocks += 1;
    if (node.type === 'inlineCode') counts.inlineCode += 1;
    if (node.type === 'mdxJsxFlowElement') counts.mdxJsxFlow += 1;
    if (node.type === 'mdxJsxTextElement') counts.mdxJsxText += 1;
    if (node.type === 'mdxjsEsm') counts.mdxjsEsm += 1;
    if (node.type === 'link') counts.links += 1;
    if (node.type === 'image') counts.images += 1;
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  return counts;
}
