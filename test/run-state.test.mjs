import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createRunDirectory, readEvaluation } from '../scripts/run-state.mjs';

test('a new run cannot reuse a stale passing report after evaluator failure', async () => {
  const target = await mkdtemp(resolve(tmpdir(), 'qwen-stale-'));
  const old = await createRunDirectory(target);
  await writeFile(resolve(old, 'report.json'), JSON.stringify({ results: [{ status: 'PASS' }], passed: 1, total: 1 }));
  const current = await createRunDirectory(target);
  assert.notEqual(current, old);
  await assert.rejects(readEvaluation(current, 1));
  await assert.rejects(readEvaluation(old, 1), /disagree/);
  await assert.rejects(readEvaluation(old, null), /infrastructure/);
  assert.equal((await readEvaluation(old, 0)).passed, 1);
});
