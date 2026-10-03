import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRepairUnit, validateUnitPatches } from '../scripts/repair-units.mjs';
import { parse } from 'acorn';

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

test('JavaScript repair excerpts preserve complete statements instead of cutting identifiers', () => {
  const script = Array.from({ length: 10 }, (_, index) => `function action${index}(){const value='${'x'.repeat(1400)}';return value;}\n`).join('');
  const files = { 'app.js': script, 'index.html': '<main></main>' };
  const first = selectRepairUnit(files, ['app.js'], 'booking', 0);
  for (let attempt = 0; attempt < first.unitCount; attempt++) {
    const unit = selectRepairUnit(files, ['app.js'], 'booking', attempt);
    assert.ok(unit.content.length <= 6000);
    assert.equal(script.slice(unit.offset, unit.offset + unit.content.length), unit.content);
    assert.doesNotThrow(() => parse(unit.content, { ecmaVersion: 'latest' }));
  }
});

test('unit repairs reject writes outside the selected source window or file', () => {
  const unit = { path: 'styles.css', content: '.header {padding:90px;}' };
  assert.equal(validateUnitPatches(unit, [{ path: 'styles.css', oldString: 'padding:90px', newString: 'padding:24px' }]).length, 1);
  assert.throws(() => validateUnitPatches(unit, [{ path: 'app.js', oldString: 'padding:90px', newString: 'padding:24px' }]));
  assert.throws(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: '.elsewhere{}', newString: '.elsewhere{color:red}' }]));
  assert.throws(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: '', newString: 'bad' }]));
});
