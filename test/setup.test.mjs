import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const setup = resolve('scripts/setup.mjs');
test('installation preserves model, MCP and other agents and refuses duplicate replacement', async () => {
  const target = await mkdtemp(resolve(tmpdir(), 'qwen-ui-test-'));
  const original = { model: 'ollama/custom', mcp: { demo: { enabled: false } }, agent: { reviewer: { temperature: 0.1 } } };
  await writeFile(resolve(target, 'opencode.json'), JSON.stringify(original));
  assert.equal(spawnSync(process.execPath, [setup, target]).status, 0);
  const installed = JSON.parse(await readFile(resolve(target, 'opencode.json')));
  assert.equal(installed.model, original.model);
  assert.deepEqual(installed.mcp, original.mcp);
  assert.deepEqual(installed.agent.reviewer, original.agent.reviewer);
  assert.equal(installed.agent['local-ui'].tools['*'], false);
  assert.equal(installed.agent['local-ui'].tools.skill, true);
  assert.match(await readFile(resolve(target, '.opencode/skills/qwen-samkill-ui/SKILL.md'), 'utf8'), /name: qwen-samkill-ui/);
  assert.equal((await readdir(target)).filter(f => f.endsWith('.bak')).length, 1);
  assert.notEqual(spawnSync(process.execPath, [setup, target]).status, 0);
  assert.deepEqual(JSON.parse(await readFile(resolve(target, 'opencode.json'))), installed);
});
test('JSONC is left untouched', async () => {
  const target = await mkdtemp(resolve(tmpdir(), 'qwen-ui-jsonc-'));
  await writeFile(resolve(target, 'opencode.jsonc'), '{}');
  assert.notEqual(spawnSync(process.execPath, [setup, target]).status, 0);
  assert.deepEqual(await readdir(target), ['opencode.jsonc']);
});
