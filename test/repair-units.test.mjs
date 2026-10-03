import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRepairUnit, validateUnitPatches } from '../scripts/repair-units.mjs';

test('repair units bound source, rotate stalled work and preserve exact source substrings', () => {
  const files = { 'styles.css': '.header {padding:90px;}\n' + '.card {color:red;}\n'.repeat(800), 'index.html': '<h1 class="header">Hello</h1>' };
  const first = selectRepairUnit(files, ['styles.css'], 'header padding too large', 0);
  const next = selectRepairUnit(files, ['styles.css'], 'header padding too large', 1);
  assert.ok(first.content.length <= 6000);
  assert.ok(first.context.length <= 12000);
  assert.ok(files[first.path].includes(first.content));
  assert.notEqual(first.offset, next.offset);
  assert.match(first.content, /header/);
  assert.match(first.context, /partial|excerpt/i);
});

test('unit repairs reject writes outside the selected source window or file', () => {
  const unit = { path: 'styles.css', content: '.header {padding:90px;}' };
  assert.equal(validateUnitPatches(unit, [{ path: 'styles.css', oldString: 'padding:90px', newString: 'padding:24px' }]).length, 1);
  assert.throws(() => validateUnitPatches(unit, [{ path: 'app.js', oldString: 'padding:90px', newString: 'padding:24px' }]));
  assert.throws(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: '.elsewhere{}', newString: '.elsewhere{color:red}' }]));
  assert.throws(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: '', newString: 'bad' }]));
});
