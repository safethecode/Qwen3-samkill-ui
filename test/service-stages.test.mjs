import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleStages, serviceStages, stagesForFlow, validateStage } from '../scripts/service-stages.mjs';

test('service work is split into independently parsed pieces and assembled without rewriting prior stages', () => {
  assert.equal(serviceStages.length, 6);
  assert.ok(serviceStages.every(stage => stage.tokens <= 2048));
  const files = assembleStages({ shell: '<html></html>', state: 'const state = [];', behavior: 'state.push(1);', forms: 'state.push(2);', layout: 'body {margin:0}', responsive: '@media(max-width:400px){body{padding:16px}}' });
  assert.equal(files['app.js'], 'const state = [];\nstate.push(1);\nstate.push(2);');
  assert.throws(() => assembleStages({ shell: '<html></html>', state: 'const state = [];', behavior: 'const state = 1;', layout: '', responsive: '' }), /already been declared/);
  assert.throws(() => assembleStages({ shell: '<html></html>' }), /Missing/);
});

test('static lifecycle requires a callable renderer and preserves its checkpoint bootstrap', () => {
  const stages = stagesForFlow('static');
  const state = stages.find(stage => stage.id === 'state');
  for (const code of ['void 0;', 'async function renderStaticView() {}', 'function renderStaticView(target) {}']) assert.throws(() => validateStage(state, code, {}), /synchronous top-level/);
  assert.doesNotThrow(() => validateStage(state, 'function renderStaticView() {}', {}));
  const forms = stages.find(stage => stage.id === 'forms');
  assert.throws(() => validateStage(forms, 'void 0;', {}), /checkpoint/);
  assert.equal(stagesForFlow('booking'), serviceStages);
});
