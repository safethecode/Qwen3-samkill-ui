import test from 'node:test';
import assert from 'node:assert/strict';
import { applyPatches } from '../scripts/patches.mjs';

test('patches reject no-ops, ambiguous matches and escaping targets without mutation', () => {
  const files = { 'app.js': 'let value = null;\nlet other = null;' };
  assert.throws(() => applyPatches(files, [{ path: '../app.js', oldString: 'a', newString: 'b' }]));
  assert.throws(() => applyPatches(files, [{ path: 'app.js', oldString: 'null', newString: 'false' }]));
  assert.throws(() => applyPatches(files, [{ path: 'app.js', oldString: 'let value', newString: 'let value' }]));
  assert.equal(files['app.js'], 'let value = null;\nlet other = null;');
  assert.equal(applyPatches(files, [{ path: 'app.js', oldString: 'let value = null;', newString: 'let value = false;' }])['app.js'], 'let value = false;\nlet other = null;');
});

test('consistent nested replacement contexts are merged without weakening exact matching', () => {
  const files = { 'app.js': 'const intro = read();\nif (!title || !intro) return;' };
  const patches = [
    { path: 'app.js', oldString: 'if (!title || !intro) return;', newString: 'if (!title) return;' },
    { path: 'app.js', oldString: files['app.js'], newString: 'const intro = read();\nif (!title) return;' }
  ];
  assert.equal(applyPatches(files, patches)['app.js'], patches[1].newString);
  assert.equal(applyPatches(files, [patches[0], patches[0]])['app.js'], patches[1].newString);
  assert.throws(() => applyPatches(files, [patches[0], { ...patches[1], newString: 'conflicting change' }]));
  assert.equal(files['app.js'], patches[1].oldString);
});
