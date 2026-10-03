import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateAssetReferences } from '../scripts/asset-references.mjs';

test('invented fonts and image data fail before dependent generation stages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-asset-refs-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets/real.svg'), '<svg/>');
  await assert.rejects(validateAssetReferences(root, { file: 'styles.css' }, '@font-face{src:url("assets/missing.woff2")}'), /Unprovided/);
  await assert.rejects(validateAssetReferences(root, { file: 'app.js' }, 'const data={image:"assets/missing.jpg"};'), /Unprovided/);
  await assert.rejects(validateAssetReferences(root, { file: 'index.html' }, '<img src="https://example.test/invented.png">'), /Unprovided/);
  await validateAssetReferences(root, { file: 'index.html' }, '<img src="assets/real.svg">');
});

test('missing asset errors identify only unambiguous supplied filename matches', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-asset-suggestion-'));
  await mkdir(join(root, 'assets/reference'), { recursive: true });
  await writeFile(join(root, 'assets/reference/bell.svg'), '<svg/>');
  await assert.rejects(validateAssetReferences(root, { file: 'index.html' }, '<img src="assets/icons/bell.svg">'), /assets\/icons\/bell\.svg -> assets\/reference\/bell\.svg/);
  await mkdir(join(root, 'assets/other'));
  await writeFile(join(root, 'assets/other/bell.svg'), '<svg/>');
  await assert.rejects(validateAssetReferences(root, { file: 'index.html' }, '<img src="assets/icons/bell.svg">'), error => !error.message.includes(' -> '));
  await assert.rejects(validateAssetReferences(root, { file: 'index.html' }, '<img src="https://example.test/bell.svg">'), error => !error.message.includes(' -> '));
});
