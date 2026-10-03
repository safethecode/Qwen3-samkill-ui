import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceProgress } from '../scripts/service-progress.mjs';

const report = statuses => ({ total: statuses.length, passed: statuses.filter(status => status === 'PASS').length, checks: statuses.map((status, index) => ({ name: String(index), status })) });

test('small repairs can remain staged until the whole failing check improves', () => {
  const initial = report(['PASS', 'FAIL']);
  assert.equal(serviceProgress(initial, report(['PASS', 'FAIL'])).decision, 'stage');
  assert.equal(serviceProgress(initial, report(['PASS', 'PASS'])).decision, 'accept');
  assert.equal(serviceProgress(initial, report(['FAIL', 'PASS'])).decision, 'reject');
  assert.equal(serviceProgress(initial, report(['PASS'])).decision, 'reject');
});
