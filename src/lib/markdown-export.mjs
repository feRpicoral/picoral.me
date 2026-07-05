import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';

const PROJECT_IMAGE = 'ProjectImage';

const STRINGIFY_OPTIONS = {
  bullet: '-',
  emphasis: '_',
  strong: '*',
  fence: '`',
  fences: true,
  listItemIndent: 'one',
  rule: '-',
};

const attrValue = (node, name) => {
  const attr = (node.attributes ?? []).find((a) => a.type === 'mdxJsxAttribute' && a.name === name);
  return attr && typeof attr.value === 'string' ? attr.value : undefined;
};

const captionOf = (node) =>
  node.name === PROJECT_IMAGE ? (attrValue(node, 'caption') ?? attrValue(node, 'alt')) : undefined;

const italic = (value) => ({
  type: 'emphasis',
  children: [{ type: 'text', value }],
});

/**
 * Lower an MDX body (frontmatter already stripped by the content loader) to plain
 * CommonMark. MDX-only nodes have no Markdown equivalent: import/export and
 * expression nodes are dropped, and `<ProjectImage>` — whose `src` points at an
 * unservable build-time asset path — is replaced by its human caption (or alt) as
 * an italic line, which is the part worth reading in a text-only view.
 */
export function mdxToMarkdown(body) {
  const tree = unified().use(remarkParse).use(remarkMdx).parse(body);

  visit(tree, (node, index, parent) => {
    if (!parent || index === null) return undefined;

    if (
      node.type === 'mdxjsEsm' ||
      node.type === 'mdxFlowExpression' ||
      node.type === 'mdxTextExpression'
    ) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }

    if (node.type === 'mdxJsxFlowElement') {
      const caption = captionOf(node);
      if (caption)
        parent.children.splice(index, 1, { type: 'paragraph', children: [italic(caption)] });
      else parent.children.splice(index, 1);
      return [SKIP, index];
    }

    if (node.type === 'mdxJsxTextElement') {
      const caption = captionOf(node);
      if (caption) parent.children.splice(index, 1, italic(caption));
      else parent.children.splice(index, 1);
      return [SKIP, index];
    }

    return undefined;
  });

  return unified().use(remarkStringify, STRINGIFY_OPTIONS).stringify(tree).trim();
}
