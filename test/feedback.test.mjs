import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFailure, selectRepair } from '../scripts/feedback.mjs';
import { sourceNamesFor } from '../scripts/repair.mjs';

test('repair scheduling prioritizes broken execution and rotates away from stalled checks', () => {
  const report = { results: ['three-example-documents', 'visible-labels-and-create', 'runtime-errors'].map(name => ({ name, status: 'FAIL' })) };
  assert.equal(selectFailure(report, {}).name, 'runtime-errors');
  assert.equal(selectFailure(report, { 'runtime-errors': 2 }).name, 'visible-labels-and-create');
  assert.equal(selectFailure(report, { 'runtime-errors': 2, 'visible-labels-and-create': 2 }).name, 'three-example-documents');
});

test('rotating from stalled behavior to layout drops unrelated retry context and broad file scope', () => {
  const previous = { name: 'three-example-documents', status: 'FAIL' };
  const report = { results: [previous, { name: 'design-mobile-stack', status: 'FAIL' }] };
  const reason = 'Previous patch did not fix example labels; rejected source has been restored.';
  const retry = selectRepair(report, {}, previous, reason);
  assert.equal(retry.failure.name, previous.name);
  assert.equal(retry.previousError, reason);
  const rotated = selectRepair(report, { 'three-example-documents': 2 }, previous, reason);
  assert.equal(rotated.failure.name, 'design-mobile-stack');
  assert.equal(rotated.previousError, '');
  assert.deepEqual(sourceNamesFor(rotated.failure, rotated.previousError), ['styles.css']);
});
