import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceProgress } from '../scripts/service-progress.mjs';

test('measured reductions preserve useful partial repairs without declaring a failing check passed', () => {
  const current = { passed: 0, total: 1, checks: [{ name: 'readable', status: 'FAIL' }], measurements: { readable: 8 } };
  const candidate = { ...current, measurements: { readable: 3 } };
  assert.equal(serviceProgress(current, candidate).decision, 'accept');
  assert.equal(candidate.checks[0].status, 'FAIL');
  assert.equal(serviceProgress(current, { ...current, measurements: { readable: 9 } }).decision, 'reject');
  assert.equal(serviceProgress(current, { ...current, measurements: {} }).decision, 'reject');
  assert.equal(serviceProgress({ ...current, contentInventory: { 390: { 'Required copy': 1 } } }, { ...candidate, contentInventory: { 390: {} } }).decision, 'reject');
});

const report = statuses => ({ total: statuses.length, passed: statuses.filter(status => status === 'PASS').length, checks: statuses.map((status, index) => ({ name: String(index), status })) });

test('small repairs can remain staged until the whole failing check improves', () => {
  const initial = report(['PASS', 'FAIL']);
  assert.equal(serviceProgress(initial, report(['PASS', 'FAIL'])).decision, 'stage');
  assert.equal(serviceProgress(initial, report(['PASS', 'PASS'])).decision, 'accept');
  assert.equal(serviceProgress(initial, report(['FAIL', 'PASS'])).decision, 'reject');
  assert.equal(serviceProgress(initial, report(['PASS'])).decision, 'reject');
});
