import test from 'node:test';
import assert from 'node:assert/strict';
import { assessProgress } from '../scripts/progress.mjs';

const report = entries => ({ results: Object.entries(entries).map(([name, status]) => ({ name, status })) });

test('repairs cannot trade a previously passing behavior for another pass', () => {
  const before = report({ create: 'PASS', archive: 'FAIL', search: 'FAIL' });
  const after = report({ create: 'FAIL', archive: 'PASS', search: 'PASS' });
  assert.deepEqual(assessProgress(before, after), { accept: false, regressions: ['create'], fixed: ['archive', 'search'] });
  assert.equal(assessProgress(before, report({ create: 'PASS', archive: 'PASS', search: 'FAIL' })).accept, true);
  assert.equal(assessProgress(before, before).accept, false);
});
