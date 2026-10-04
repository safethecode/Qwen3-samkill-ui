import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeIconAssets, verifiedIconAssets, appendIconVariant } from '../scripts/icon-assets.mjs';

test('explicit icon paint variants preserve official geometry and reject tampered paint', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-icon-state-'));
  await writeIconAssets(target, ['Search']);
  await appendIconVariant(target, { name: 'Heart', variant: 'selected', fill: '#f46168', stroke: '#f46168' });
  const assets = await verifiedIconAssets(target);
  assert.ok(assets['/assets/icons/Heart-selected.svg']);
  assert.ok(assets['/assets/icons/Search.svg']);
  await assert.rejects(appendIconVariant(target, { name: 'Heart', variant: '../escape', fill: '#f46168', stroke: 'none' }));
  await assert.rejects(appendIconVariant(target, { name: 'Heart', variant: 'selected', fill: '#f46168', stroke: '#f46168' }));
  const path = join(target, 'assets/icons/Heart-selected.svg');
  await writeFile(path, (await readFile(path, 'utf8')).replaceAll('#f46168', '#000000'));
  await assert.rejects(verifiedIconAssets(target), /integrity mismatch/);
});

test('official asset export verifies geometry and licensing and preserves existing directories', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-icons-'));
  await writeIconAssets(target, ['Search', 'X']);
  assert.equal(Object.keys(await verifiedIconAssets(target)).length, 2);
  await assert.rejects(writeIconAssets(target, ['Plus']), /not empty/);
  const path = join(target, 'assets/icons/Search.svg');
  await writeFile(path, (await readFile(path, 'utf8')).replace('m21 21', 'm20 20'));
  await assert.rejects(verifiedIconAssets(target), /integrity mismatch/);
});
