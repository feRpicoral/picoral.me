import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getHandler } from './handlers.mjs';

test('education handler extracts only degree, detail, and location', () => {
  const handler = getHandler('education');
  const fm = {
    slug: 'bsc-computer-science',
    degree: 'Bachelor of Science in Computer Science',
    school: 'University of Colorado Boulder',
    detail: 'Major GPA 3.9 / 4.0',
    period: { start: '2022-08', end: '2026-05' },
    location: 'Boulder, CO',
    order: 0,
  };

  const ids = handler.extract(fm).map((s) => s.id);

  assert.deepEqual(ids, ['fm:degree', 'fm:detail', 'fm:location']);
});

test('education handler never extracts the school name', () => {
  const handler = getHandler('education');
  const fm = {
    degree: 'Minor in Business Administration',
    school: 'University of Colorado Boulder',
    detail: 'GPA 3.9 / 4.0',
    period: { start: '2023-08', end: '2025-08' },
    location: 'Boulder, CO',
    order: 1,
  };

  const texts = handler.extract(fm).map((s) => s.text);

  assert.ok(!texts.includes(fm.school));
});

test('education handler injects translations and preserves school, period, slug, and order', () => {
  const handler = getHandler('education');
  const fm = {
    slug: 'bsc-computer-science',
    degree: 'Bachelor of Science in Computer Science',
    school: 'University of Colorado Boulder',
    detail: 'Major GPA 3.9 / 4.0',
    period: { start: '2022-08', end: '2026-05' },
    location: 'Boulder, CO',
    order: 0,
  };

  const next = handler.inject(fm, {
    'fm:degree': 'Bacharelado em Ciência da Computação',
    'fm:detail': 'GPA da área principal 3,9 / 4,0',
    'fm:location': 'Boulder, CO',
  });

  assert.equal(next.degree, 'Bacharelado em Ciência da Computação');
  assert.equal(next.detail, 'GPA da área principal 3,9 / 4,0');
  assert.equal(next.school, 'University of Colorado Boulder');
  assert.deepEqual(next.period, { start: '2022-08', end: '2026-05' });
  assert.equal(next.slug, 'bsc-computer-science');
  assert.equal(next.order, 0);
});

test('experience handler extracts role, location, summary, and each highlight', () => {
  const handler = getHandler('experience');
  const fm = {
    company: 'Google',
    role: 'Software Engineer Intern',
    location: 'New York, NY · Hybrid',
    period: { start: '2025-05', end: '2025-08' },
    summary: 'Backend work on Google Keep.',
    highlights: ['Implemented gRPC endpoints in Java.', 'Ramped to 15k RPS.'],
    tech: ['Java', 'gRPC'],
    type: 'internship',
    order: 1,
  };

  const ids = handler.extract(fm).map((s) => s.id);

  assert.deepEqual(ids, [
    'fm:role',
    'fm:location',
    'fm:summary',
    'fm:highlights[0]',
    'fm:highlights[1]',
  ]);
});

test('experience handler injects translations and preserves company, type, period, and order', () => {
  const handler = getHandler('experience');
  const fm = {
    company: 'Google',
    role: 'Software Engineer Intern',
    location: 'New York, NY · Hybrid',
    period: { start: '2025-05', end: '2025-08' },
    summary: 'Backend work on Google Keep.',
    highlights: ['Implemented gRPC endpoints in Java.'],
    tech: ['Java', 'gRPC'],
    type: 'internship',
    order: 1,
  };

  const next = handler.inject(fm, {
    'fm:role': 'Engenheiro de Software Estagiário',
    'fm:location': 'Nova York, NY · Híbrido',
    'fm:summary': 'Trabalho de backend no Google Keep.',
    'fm:highlights[0]': 'Implementei endpoints gRPC em Java.',
  });

  assert.equal(next.role, 'Engenheiro de Software Estagiário');
  assert.equal(next.summary, 'Trabalho de backend no Google Keep.');
  assert.deepEqual(next.highlights, ['Implementei endpoints gRPC em Java.']);
  assert.equal(next.company, 'Google');
  assert.equal(next.type, 'internship');
  assert.deepEqual(next.period, { start: '2025-05', end: '2025-08' });
  assert.deepEqual(next.tech, ['Java', 'gRPC']);
  assert.equal(next.order, 1);
});
