import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFailure } from '../scripts/feedback.mjs';

test('repair scheduling prioritizes broken execution and rotates away from stalled checks', () => {
  const report = { results: ['three-example-documents', 'visible-labels-and-create', 'runtime-errors'].map(name => ({ name, status: 'FAIL' })) };
  assert.equal(selectFailure(report, {}).name, 'runtime-errors');
  assert.equal(selectFailure(report, { 'runtime-errors': 2 }).name, 'visible-labels-and-create');
  assert.equal(selectFailure(report, { 'runtime-errors': 2, 'visible-labels-and-create': 2 }).name, 'three-example-documents');
});
