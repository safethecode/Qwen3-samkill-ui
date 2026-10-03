import test from 'node:test';
import assert from 'node:assert/strict';
import { runQualityLoop } from '../scripts/quality-loop.mjs';
import { criteria } from '../scripts/quality-policy.mjs';
import { PatchError } from '../scripts/patches.mjs';

const inspection = (score, binding = 'same') => ({ binding, functional: { passed: 1, total: 1, results: [{ name: 'create', status: 'PASS' }] }, visual: Object.fromEntries(['desktop', 'mobile'].map(view => [view, { criteria: criteria.map(id => ({ id, score, confidence: 0.95, observation: 'The supplied screenshot shows comparable document hierarchy.' })), issues: score >= 4 ? [] : [{ criterion: 'actions', location: 'first card actions', problem: 'Three oversized mobile action rows.', correction: 'Use a compact row with one emphasized primary action.', files: ['styles.css'] }] }])) });

test('repair timeouts consume the bounded retry budget without claiming completion', async () => {
  let calls = 0;
  const result = await runQualityLoop({ rounds: 2, inspect: async () => inspection(3), snapshot: async () => 'source', restore: async () => {}, repair: async () => { calls++; throw new DOMException('Timed out', 'TimeoutError'); }, record: async () => {} });
  assert.equal(calls, 2);
  assert.equal(result.status, 'INCOMPLETE');
  assert.match(result.reason, /budget/);
});

test('a passing first review cannot finish when independent confirmation fails', async () => {
  const pending = [inspection(4), inspection(3)];
  const result = await runQualityLoop({ rounds: 0, inspect: async () => pending.shift(), snapshot: async () => 'source', restore: async () => {}, repair: async () => {}, record: async () => {} });
  assert.equal(result.status, 'INCOMPLETE');
  assert.match(result.reason, /budget/);
});

test('regressing candidates roll back, stalls escalate and two independent passing views complete', async () => {
  const badFunction = inspection(5); badFunction.functional = { passed: 0, total: 1, results: [{ name: 'create', status: 'FAIL' }] };
  const pending = [inspection(3), badFunction, inspection(3), inspection(4), inspection(4)];
  const strategies = []; let restored = 0;
  const result = await runQualityLoop({ rounds: 3, inspect: async () => pending.shift(), snapshot: async () => 'source', restore: async () => { restored++; }, repair: async (failure, strategy) => { strategies.push(strategy); }, record: async () => {} });
  assert.equal(result.status, 'COMPLETE');
  assert.equal(restored, 2);
  assert.deepEqual(strategies, ['patches', 'patches', 'files']);
});

test('inspection errors restore applied edits and stale confirmation never completes', async () => {
  let calls = 0; let restored = false;
  const failed = await runQualityLoop({ rounds: 1, inspect: async () => { if (++calls > 1) throw new Error('Review timed out'); return inspection(3); }, snapshot: async () => 'source', restore: async () => { restored = true; }, repair: async () => {}, record: async () => {} });
  assert.equal(failed.status, 'INCOMPLETE');
  assert.equal(restored, true);
  const pending = [inspection(4), inspection(4, 'changed')];
  const stale = await runQualityLoop({ rounds: 0, inspect: async () => pending.shift(), snapshot: async () => 'source', restore: async () => {}, repair: async () => {}, record: async () => {} });
  assert.equal(stale.status, 'INCOMPLETE');
  assert.match(stale.reason, /changed/);
});

test('a rejected audit cannot lower the regression baseline for subsequent repairs', async () => {
  const pending = [inspection(5), inspection(3), inspection(4), inspection(4)];
  let restored = 0;
  const result = await runQualityLoop({ rounds: 1, inspect: async () => pending.shift(), snapshot: async () => 'source', restore: async () => { restored++; }, repair: async () => {}, record: async () => {} });
  assert.equal(result.status, 'INCOMPLETE');
  assert.equal(restored, 1);
});

test('invalid model patches are bounded retries, not successful repairs or unhandled errors', async () => {
  const modes = [];
  const result = await runQualityLoop({ rounds: 3, inspect: async () => inspection(3), snapshot: async () => 'source', restore: async () => {}, repair: async (_failure, mode) => { modes.push(mode); throw new PatchError('No unique match'); }, record: async () => {} });
  assert.equal(result.status, 'INCOMPLETE');
  assert.equal(result.attempts, 3);
  assert.deepEqual(modes, ['patches', 'patches', 'files']);
});
