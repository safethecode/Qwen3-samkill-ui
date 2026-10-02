import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('a global example notice does not substitute for visible sample status on each card', async () => {
  await mkdir(resolve(repo, 'runs'), { recursive: true });
  const target = await mkdtemp(resolve(repo, 'runs/badge-regression-'));
  for (const name of ['index.html', 'styles.css', 'app.js']) {
    let source = await readFile(resolve(repo, 'examples/resume', name), 'utf8');
    if (name === 'index.html') source = source.replace('<body>', '<body><p>예시 데이터</p>');
    if (name === 'app.js') source = source.replace('<span class="example-label">예시</span>', '');
    await writeFile(resolve(target, name), source);
  }
  await promisify(execFile)(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, resolve(target, 'evidence')], { env: { ...process.env, QWEN_DESIGN_CHECKS: '0' }, timeout: 60000 }).catch(error => { if (error.code !== 1) throw error; });
  const report = JSON.parse(await readFile(resolve(target, 'evidence/report.json'), 'utf8'));
  assert.equal(report.results.find(result => result.name === 'three-example-documents').status, 'FAIL');
});

test('a sample badge hidden only at mobile width still fails the fixture', async () => {
  const target = await mkdtemp(resolve(repo, 'runs/mobile-badge-regression-'));
  for (const name of ['index.html', 'styles.css', 'app.js']) {
    let source = await readFile(resolve(repo, 'examples/resume', name), 'utf8');
    if (name === 'styles.css') source += '\n@media (max-width: 500px) { .example-label { visibility: hidden; } }';
    await writeFile(resolve(target, name), source);
  }
  await promisify(execFile)(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, resolve(target, 'evidence')], { env: { ...process.env, QWEN_DESIGN_CHECKS: '0' }, timeout: 60000 }).catch(error => { if (error.code !== 1) throw error; });
  const report = JSON.parse(await readFile(resolve(target, 'evidence/report.json'), 'utf8'));
  const result = report.results.find(result => result.name === 'three-example-documents');
  assert.equal(result.status, 'FAIL');
  assert.match(result.detail, /"width":390/);
  assert.match(result.detail, /"reason":"hidden"/);
});
