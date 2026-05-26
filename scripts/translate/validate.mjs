/**
 * Validate translated output against the per-snippet constraints and the
 * structural fingerprint of the source MDX tree.
 *
 * Returns an array of human-readable issues. Empty array = pass.
 */
export function validateTranslations({ snippets, byId }) {
  const issues = [];
  const ids = new Set(snippets.map((s) => s.id));
  const returnedIds = new Set(Object.keys(byId));

  for (const id of ids) {
    if (!returnedIds.has(id)) {
      issues.push(`Missing translation for snippet id "${id}".`);
    }
  }
  for (const id of returnedIds) {
    if (!ids.has(id)) {
      issues.push(`Unexpected translation id "${id}" not present in input.`);
    }
  }
  for (const snippet of snippets) {
    const t = byId[snippet.id];
    if (typeof t !== 'string') continue;
    if (!t.trim()) {
      issues.push(`Translation for "${snippet.id}" is empty.`);
      continue;
    }
    if (snippet.max_chars && t.length > snippet.max_chars) {
      issues.push(
        `Translation for "${snippet.id}" is ${t.length} chars, exceeds max_chars=${snippet.max_chars}.`,
      );
    }
  }
  return issues;
}

export function compareStructuralFingerprints(source, translated) {
  const issues = [];
  for (const key of Object.keys(source)) {
    if (source[key] !== translated[key]) {
      issues.push(
        `Structural mismatch for ${key}: source=${source[key]}, translated=${translated[key]}`,
      );
    }
  }
  return issues;
}
