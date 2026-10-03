import test from 'node:test';
import assert from 'node:assert/strict';
import { rollbackOwned, assertOwned } from '../scripts/owned-rollback.mjs';

test('passing evaluation cannot accept a concurrently changed source snapshot', async () => {
  const accepted = ['generated source'];
  let current = [...accepted];
  await assertOwned(async () => current, accepted);
  current = ['edited while browser checks ran'];
  await assert.rejects(assertOwned(async () => current, accepted), { code: 'STALE_SOURCE' });
});

test('failed requests that never wrote source preserve edits made during inference', async () => {
  let source = ['user edit'];
  await rollbackOwned(async () => source, async next => { source = next; }, null, ['original']);
  assert.deepEqual(source, ['user edit']);
});

test('rollback only restores source still owned by the rejected candidate', async () => {
  let source = ['external edit'];
  await assert.rejects(rollbackOwned(async () => source, async next => { source = next; }, ['candidate'], ['original']), { code: 'STALE_SOURCE' });
  assert.deepEqual(source, ['external edit']);
  source = ['candidate'];
  await rollbackOwned(async () => source, async next => { source = next; }, ['candidate'], ['original']);
  assert.deepEqual(source, ['original']);
});
