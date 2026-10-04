import test from 'node:test';
import assert from 'node:assert/strict';
import { skillInventory, stageSkillContext, componentSkillContext } from '../scripts/skill-context.mjs';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('component styling receives complete applicable guides with source hashes', async () => {
  const context = await componentSkillContext({ assets: ['assets/icons/Heart.svg'] });
  for (const path of ['../decomposed-layout.md', 'reference-to-ui/references/typography.md', 'reference-to-ui/references/mobile.md', 'reference-to-ui/references/design-guardrails.md', 'reference-to-ui/references/icon-controls.md']) {
    const source = await readFile(new URL(`../skills/qwen-samkill-ui/references/upstream/${path}`, import.meta.url), 'utf8');
    assert.ok(context.text.includes(source));
    assert.ok(context.sources.some(item => item.path === path && item.sha256 === createHash('sha256').update(source).digest('hex')));
  }
  const withoutIcons = await componentSkillContext({ assets: [] });
  assert.ok(!withoutIcons.sources.some(item => item.path.endsWith('icon-controls.md')));
});

test('direct model stages receive the linked local decomposition guide as source-bound text', async () => {
  const text = await readFile(new URL('../skills/qwen-samkill-ui/references/decomposed-layout.md', import.meta.url), 'utf8');
  const hash = createHash('sha256').update(text).digest('hex');
  for (const stage of ['shell', 'state', 'behavior', 'forms', 'layout', 'responsive']) {
    const context = await stageSkillContext(stage);
    assert.ok(context.text.includes(text), `${stage} must receive the actual guide, not just a link`);
    assert.ok(context.sources.some(source => source.path === '../decomposed-layout.md' && source.sha256 === hash));
  }
});

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
