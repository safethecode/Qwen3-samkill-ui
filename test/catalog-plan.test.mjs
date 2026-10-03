import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { prepareCatalogPlan } from '../scripts/catalog-plan.mjs';

test('full catalog plans preserve unknowns and existing observations rather than minting passes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-catalog-'));
  const plan = await prepareCatalogPlan(root);
  assert.equal(plan.rules.length, 75);
  assert.equal(plan.guides.length, 8);
  assert.ok(plan.rules.every(rule => rule.status === 'unknown' && rule.applicability === 'UNVERIFIED' && rule.checks.length));
  const path = join(root, 'design/review-plan.json');
  plan.rules[0].reason = 'Existing review finding';
  await writeFile(path, JSON.stringify(plan));
  assert.equal((await prepareCatalogPlan(root)).rules[0].reason, 'Existing review finding');
  assert.match(await readFile(path, 'utf8'), /Existing review finding/);
});
