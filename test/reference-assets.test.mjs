import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { prepareReferenceAssets } from '../scripts/reference-assets.mjs';

test('reference assets retain bytes and provenance without copying implementation or private paths', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-reference-assets-'));
  const upstream = join(root, 'upstream');
  const target = join(root, 'candidate');
  await mkdir(join(upstream, 'round/assets'), { recursive: true });
  await writeFile(join(upstream, 'round/index.html'), '<html></html>');
  await writeFile(join(upstream, 'round/assets/photo.png'), 'exact image bytes');
  await writeFile(join(upstream, 'round/assets/app.js'), 'not an asset');
  const manifest = await prepareReferenceAssets(target, { entry: 'round/index.html' }, upstream);
  assert.equal(manifest.files.length, 1);
  assert.equal(await readFile(join(target, manifest.files[0].path), 'utf8'), 'exact image bytes');
  assert.ok(!JSON.stringify(manifest).includes(root));
  await assert.rejects(prepareReferenceAssets(target, { entry: 'round/index.html' }, upstream), /EEXIST/);
});
