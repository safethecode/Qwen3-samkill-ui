import test from 'node:test';
import assert from 'node:assert/strict';
import { skillInventory, stageSkillContext } from '../scripts/skill-context.mjs';

test('all active catalog rules remain available and stage prompts carry original font and icon rules', async () => {
  const inventory = await skillInventory();
  assert.equal(inventory.rules.length, 75);
  assert.equal(new Set(inventory.rules.map(rule => rule.id)).size, 75);
  assert.equal(inventory.sources.filter(source => source.path.endsWith('/guide.md')).length, 8);
  assert.ok(inventory.rules.every(rule => rule.original && rule.checks.length));
  assert.match((await stageSkillContext('layout')).text, /font|폰트|서체/);
  assert.match((await stageSkillContext('shell')).text, /24|아이콘/);
  assert.match((await stageSkillContext('behavior')).text, /상태/);
  await assert.rejects(stageSkillContext('unknown'));
});
