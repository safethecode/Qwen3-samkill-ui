import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { sourceBinding } from '../scripts/source-binding.mjs';

test('font and icon asset edits invalidate the quality source binding', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-binding-'));
  await mkdir(join(target, 'assets'));
  await mkdir(join(target, 'design'));
  await writeFile(join(target, 'index.html'), '<html></html>');
  await writeFile(join(target, 'assets/font.woff2'), 'first');
  await writeFile(join(target, 'design/typography.json'), '{"roles":[]}');
  const before = await sourceBinding(target);
  await writeFile(join(target, 'assets/font.woff2'), 'changed');
  assert.notDeepEqual(await sourceBinding(target), before);
});

test('extra local styles scripts and fonts are bound outside assets', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-dependencies-'));
  await mkdir(join(target, 'fonts'));
  for (const name of ['theme.css', 'extra.js', 'fonts/local.woff2']) await writeFile(join(target, name), 'first');
  const before = await sourceBinding(target);
  assert.deepEqual(Object.keys(before).sort(), ['extra.js', 'fonts/local.woff2', 'theme.css']);
  await writeFile(join(target, 'theme.css'), 'changed');
  assert.notDeepEqual(await sourceBinding(target), before);
});

test('new evaluation output does not invalidate unchanged application sources', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-evidence-binding-'));
  await writeFile(join(target, 'index.html'), '<html></html>');
  const before = await sourceBinding(target);
  for (const directory of ['run-123/preflight', 'quality-123/inspection', 'repair-123/initial']) {
    await mkdir(join(target, directory), { recursive: true });
    await writeFile(join(target, directory, 'report.json'), '{}');
    await writeFile(join(target, directory, 'desktop.png'), 'evidence');
  }
  assert.deepEqual(await sourceBinding(target), before);
});
