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
