import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceNamesFor } from '../scripts/repair.mjs';

test('form and search repairs include both markup and behavior; stalled repairs broaden scope', () => {
  for (const name of ['search-label-and-empty-state', 'create-after-edit']) assert.deepEqual(sourceNamesFor({ name }), ['index.html', 'app.js']);
  assert.deepEqual(sourceNamesFor({ name: 'typography-390' }), ['styles.css']);
  assert.deepEqual(sourceNamesFor({ name: 'typography-390' }, 'Previous patch did not fix this check.'), ['index.html', 'styles.css', 'app.js']);
  assert.deepEqual(sourceNamesFor({ name: 'visual-review', files: ['styles.css'] }), ['styles.css']);
  assert.throws(() => sourceNamesFor({ name: 'visual-review', files: ['../private'] }));
});
