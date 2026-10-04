import test from 'node:test';
import assert from 'node:assert/strict';
import { selectRepairUnit, validateUnitPatches } from '../scripts/repair-units.mjs';
import { parse } from 'acorn';
import postcss from 'postcss';

test('ordinary typography repairs never cut a declaration at the source window boundary', () => {
  const css = '.spacer {padding:0;}\n'.repeat(297) + '\nbutton {font-family:inherit;cursor:pointer;}\n#guest {font-size:1rem;}';
  const files = { 'styles.css': css };
  const first = selectRepairUnit(files, ['styles.css'], 'button font-family typography');
  assert.equal(first.boundary, 'complete-css-statements');
  assert.ok(first.content.includes('button {font-family:inherit;cursor:pointer;}'));
  for (let attempt = 0; attempt < first.unitCount; attempt++) {
    const unit = selectRepairUnit(files, ['styles.css'], 'button font-family typography', attempt);
    assert.equal(css.slice(unit.offset, unit.offset + unit.content.length), unit.content);
    assert.doesNotThrow(() => postcss.parse(unit.content));
  }
});

test('ordinary CSS units retain related inherited typography and repair retry context', () => {
  const css = 'body{font:400 16px sans-serif}button,input{font:inherit}.row{display:flex;white-space:nowrap}';
  for (const detail of ['readable-390 input fontWeight400', 'text-200-clipping-390 row']) {
    const unit = selectRepairUnit({ 'styles.css': css }, ['styles.css'], detail);
    assert.equal(unit.content, css);
    assert.doesNotThrow(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: 'font:400', newString: 'font:500' }]));
    assert.doesNotThrow(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: 'white-space:nowrap', newString: 'white-space:normal' }]));
  }
});

test('reflow repair selects a complete active narrow grid rule with its media context', () => {
  const css = '.app-layout {display:grid;grid-template-columns:280px 1fr;}\n@media (max-width:1440px){.app-layout {grid-template-columns:240px 1fr;}}\n@media (max-width:390px){.app-layout {grid-template-columns:1fr;padding:16px;}}';
  const unit = selectRepairUnit({ 'styles.css': css, 'index.html': '<main class="app-layout"></main>' }, ['styles.css'], 'text-200-320 automatic grid track parent {"class":"app-layout"}', 0);
  assert.equal(unit.content, '.app-layout {grid-template-columns:1fr;padding:16px;}');
  assert.match(unit.context, /max-width:390px/);
  assert.equal(css.slice(unit.offset, unit.offset + unit.content.length), unit.content);
  assert.throws(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: 'grid-template-columns:280px 1fr;', newString: 'grid-template-columns:1fr;' }]));
});

test('grid rule units preserve original indentation for exact whole-rule patches', () => {
  const rule = '  .app-layout {\n    grid-template-columns: 1fr;\n  }';
  const css = `@media(max-width:390px){\n${rule}\n}`;
  const unit = selectRepairUnit({ 'styles.css': css }, ['styles.css'], 'text-200-320 automatic grid app-layout');
  assert.equal(unit.content, rule);
  assert.doesNotThrow(() => validateUnitPatches(unit, [{ path: 'styles.css', oldString: rule, newString: rule.replace('1fr', 'minmax(0,1fr)') }]));
});

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

test('markup repair can inspect the renderer without gaining permission to rewrite it', () => {
  const script = 'function render(){document.querySelector("#items").replaceChildren();}';
  const unit = selectRepairUnit({ 'index.html': '<main id="items"></main>', 'app.js': script }, ['index.html'], 'missing action');
  assert.ok(unit.context.includes(script));
  assert.match(unit.context, /READ-ONLY JAVASCRIPT/);
  assert.throws(() => validateUnitPatches(unit, [{ path: 'app.js', oldString: script, newString: 'void 0;' }]));
});
