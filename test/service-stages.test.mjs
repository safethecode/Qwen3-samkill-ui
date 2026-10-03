import test from 'node:test';
import assert from 'node:assert/strict';
import { assembleStages, serviceStages } from '../scripts/service-stages.mjs';

test('service work is split into independently parsed pieces and assembled without rewriting prior stages', () => {
  assert.equal(serviceStages.length, 5);
  assert.ok(serviceStages.every(stage => stage.tokens <= 2048));
  const files = assembleStages({ shell: '<html></html>', state: 'const state = [];', behavior: 'state.push(1);', layout: 'body {margin:0}', responsive: '@media(max-width:400px){body{padding:16px}}' });
  assert.equal(files['app.js'], 'const state = [];\nstate.push(1);');
  assert.throws(() => assembleStages({ shell: '<html></html>', state: 'const state = [];', behavior: 'const state = 1;', layout: '', responsive: '' }), /already been declared/);
  assert.throws(() => assembleStages({ shell: '<html></html>' }), /Missing/);
});
