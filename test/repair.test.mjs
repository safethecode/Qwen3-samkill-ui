import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceNamesFor, validateRepairPatches } from '../scripts/repair.mjs';
import { applyPatches } from '../scripts/patches.mjs';

test('form and search repairs include both markup and behavior; stalled repairs broaden scope', () => {
  for (const name of ['search-label-and-empty-state', 'create-after-edit']) assert.deepEqual(sourceNamesFor({ name }), ['index.html', 'app.js']);
  assert.deepEqual(sourceNamesFor({ name: 'typography-390' }), ['styles.css']);
  assert.deepEqual(sourceNamesFor({ name: 'typography-390' }, 'Previous patch did not fix this check.'), ['index.html', 'styles.css', 'app.js']);
  assert.deepEqual(sourceNamesFor({ name: 'visual-review', files: ['styles.css'] }), ['styles.css']);
  assert.throws(() => sourceNamesFor({ name: 'visual-review', files: ['../private'] }));
});

test('a coherent repair can update markup and behavior atomically', () => {
  const files = { 'index.html': '<textarea required></textarea>', 'app.js': 'if (!intro) return;' };
  const patches = validateRepairPatches([
    { path: 'index.html', oldString: ' required', newString: '' },
    { path: 'app.js', oldString: 'if (!intro) return;', newString: 'intro ||= "";' },
    { path: 'app.js', oldString: 'unchanged', newString: 'unchanged' }
  ]);
  assert.deepEqual(applyPatches(files, patches), { 'index.html': '<textarea></textarea>', 'app.js': 'intro ||= "";' });
  assert.throws(() => validateRepairPatches([{ oldString: 'a', newString: 'a' }]));
  assert.equal(validateRepairPatches([{ oldString: 'a'.repeat(828), newString: 'b' }]).length, 1);
  assert.throws(() => validateRepairPatches([{ oldString: 'a'.repeat(4001), newString: 'b' }]));
  assert.throws(() => validateRepairPatches(null));
});
