import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGeneratedFile } from '../scripts/generate.mjs';

test('generated source must be complete, match its assigned file and parse before saving', () => {
  assert.throws(() => validateGeneratedFile('app.js', { done_reason: 'length', message: { content: '{' } }));
  assert.throws(() => validateGeneratedFile('app.js', { done_reason: 'stop', message: { content: JSON.stringify({ path: '../x', content: 'alert(1)' }) } }));
  assert.throws(() => validateGeneratedFile('app.js', { done_reason: 'stop', message: { content: JSON.stringify({ path: 'app.js', content: 'function broken(' }) } }));
  assert.equal(validateGeneratedFile('app.js', { done_reason: 'stop', message: { content: JSON.stringify({ path: 'app.js', content: 'const n = 1;' }) } }), 'const n = 1;');
});
