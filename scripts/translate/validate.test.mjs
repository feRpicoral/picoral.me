import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareStructuralFingerprints, validateTranslations } from './validate.mjs';

test('validateTranslations returns no issues for valid input', () => {
  const snippets = [
    { id: 'fm:title', text: 'Hi' },
    { id: 'fm:description', text: 'World', max_chars: 20 },
  ];
  const byId = { 'fm:title': 'Olá', 'fm:description': 'Mundo' };
  assert.deepEqual(validateTranslations({ snippets, byId }), []);
});

test('validateTranslations reports missing translation', () => {
  const snippets = [{ id: 'fm:title', text: 'Hi' }];
  const issues = validateTranslations({ snippets, byId: {} });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /Missing translation/);
  assert.match(issues[0], /fm:title/);
});

test('validateTranslations reports extra id not in input', () => {
  const snippets = [{ id: 'fm:title', text: 'Hi' }];
  const byId = { 'fm:title': 'Olá', 'fm:extra': 'Surprise' };
  const issues = validateTranslations({ snippets, byId });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /Unexpected translation id/);
  assert.match(issues[0], /fm:extra/);
});

test('validateTranslations reports empty translation as issue', () => {
  const snippets = [{ id: 'fm:title', text: 'Hi' }];
  const byId = { 'fm:title': '   ' };
  const issues = validateTranslations({ snippets, byId });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /empty/);
});

test('validateTranslations reports max_chars overshoot', () => {
  const snippets = [{ id: 'fm:desc', text: 'Hi', max_chars: 5 }];
  const byId = { 'fm:desc': 'Way too long for the limit' };
  const issues = validateTranslations({ snippets, byId });
  assert.equal(issues.length, 1);
  assert.match(issues[0], /max_chars=5/);
  assert.match(issues[0], /\b26 chars\b/);
});

test('validateTranslations accumulates multiple issues', () => {
  const snippets = [
    { id: 'fm:a', text: 'A' },
    { id: 'fm:b', text: 'B', max_chars: 3 },
  ];
  const byId = { 'fm:b': 'too long' };
  const issues = validateTranslations({ snippets, byId });
  assert.equal(issues.length, 2);
});

test('compareStructuralFingerprints returns empty on identical fingerprints', () => {
  const fp = { leafBlocks: 5, codeBlocks: 2, inlineCode: 3, links: 1, images: 0 };
  assert.deepEqual(compareStructuralFingerprints(fp, fp), []);
});

test('compareStructuralFingerprints reports per-key diffs', () => {
  const before = { leafBlocks: 5, codeBlocks: 1 };
  const after = { leafBlocks: 4, codeBlocks: 2 };
  const issues = compareStructuralFingerprints(before, after);
  assert.equal(issues.length, 2);
  assert.match(issues[0], /leafBlocks.*source=5.*translated=4/);
  assert.match(issues[1], /codeBlocks.*source=1.*translated=2/);
});
