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
