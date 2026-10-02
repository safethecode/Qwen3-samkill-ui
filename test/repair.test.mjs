import test from 'node:test';
import assert from 'node:assert/strict';
import { sourceNamesFor, validateRepairPatches, buildRepairPrompt } from '../scripts/repair.mjs';
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

test('repair context contains current source, excludes rejected code and ends with the actual task', () => {
  const prompt = buildRepairPrompt({ 'app.js': 'const current = 1;\nrender();' }, 'contract', 'unrelated CSS guide', { name: 'three-example-documents', detail: 'Example label is not visible' }, 'No exact match. Rejected response: staleBrokenProgram();');
  assert.ok(prompt.includes('const current = 1;\nrender();'));
  assert.ok(!prompt.includes('staleBrokenProgram'));
  assert.ok(!prompt.includes('unrelated CSS guide'));
  assert.ok(prompt.endsWith('Fix three-example-documents: Example label is not visible'));
});
