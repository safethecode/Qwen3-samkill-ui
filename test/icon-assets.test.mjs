import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeIconAssets, verifiedIconAssets } from '../scripts/icon-assets.mjs';

test('official asset export verifies geometry and licensing and preserves existing directories', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-icons-'));
  await writeIconAssets(target, ['Search', 'X']);
  assert.equal(Object.keys(await verifiedIconAssets(target)).length, 2);
  await assert.rejects(writeIconAssets(target, ['Plus']), /not empty/);
  const path = join(target, 'assets/icons/Search.svg');
  await writeFile(path, (await readFile(path, 'utf8')).replace('m21 21', 'm20 20'));
  await assert.rejects(verifiedIconAssets(target), /integrity mismatch/);
});
