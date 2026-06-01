import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getHandler } from './handlers.mjs';

test('experience handler translates nested page data and preserves configuration fields', () => {
  const handler = getHandler('experience');
  const frontmatter = {
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of Colorado Boulder',
        detail: 'Major GPA 3.9 / 4.0',
        location: 'Boulder, CO',
      },
    ],
    work: [
      {
        company: 'Google',
        role: 'Software Engineer Intern',
        location: 'New York, NY · Hybrid',
        summary: 'Backend work on Google Keep.',
        highlights: ['Implemented gRPC endpoints in Java.'],
        tech: ['Java', 'gRPC'],
        type: 'internship',
        order: 1,
      },
    ],
  };

  const snippets = handler.extract(frontmatter);
  const translated = handler.inject(frontmatter, {
    'fm:education[0].degree': 'Bacharelado em Ciência da Computação',
    'fm:education[0].detail': 'GPA da área principal 3,9 / 4,0',
    'fm:education[0].location': 'Boulder, Colorado',
    'fm:work[0].role': 'Estagiário de Engenharia de Software',
    'fm:work[0].location': 'Nova York, NY · Híbrido',
    'fm:work[0].summary': 'Trabalho de backend no Google Keep.',
    'fm:work[0].highlights[0]': 'Implementei endpoints gRPC em Java.',
  });

  assert.deepEqual(
    snippets.map((s) => s.id),
    [
      'fm:education[0].degree',
      'fm:education[0].detail',
      'fm:education[0].location',
      'fm:work[0].role',
      'fm:work[0].location',
      'fm:work[0].summary',
      'fm:work[0].highlights[0]',
    ],
  );
  assert.equal(translated.education[0].school, 'University of Colorado Boulder');
  assert.equal(translated.education[0].degree, 'Bacharelado em Ciência da Computação');
  assert.equal(translated.work[0].company, 'Google');
  assert.deepEqual(translated.work[0].tech, ['Java', 'gRPC']);
  assert.equal(translated.work[0].type, 'internship');
  assert.equal(translated.work[0].summary, 'Trabalho de backend no Google Keep.');
});
