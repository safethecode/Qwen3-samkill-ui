import test from 'node:test';
import assert from 'node:assert/strict';
import { applyFileReplacements } from '../scripts/replacements.mjs';

test('complete-file fallback validates every source before any mutation', () => {
  const files = { 'app.js': 'const value = 1;', 'index.html': '<html></html>' };
  assert.deepEqual(applyFileReplacements(files, [{ path: 'app.js', content: 'const value = 2;' }]), { ...files, 'app.js': 'const value = 2;' });
  assert.throws(() => applyFileReplacements(files, [{ path: 'app.js', content: 'const =' }]));
  assert.throws(() => applyFileReplacements(files, [{ path: 'index.html', content: '<html>' }]));
  assert.throws(() => applyFileReplacements(files, [{ path: '../app.js', content: 'x' }]));
  assert.throws(() => applyFileReplacements(files, [{ path: 'app.js', content: files['app.js'] }]));
  assert.throws(() => applyFileReplacements(files, [{ path: 'app.js', content: 'const value = 2;' }, { path: 'app.js', content: 'const value = 3;' }]));
  assert.equal(files['app.js'], 'const value = 1;');
});
