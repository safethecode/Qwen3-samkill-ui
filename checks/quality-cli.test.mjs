import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { criteria } from '../scripts/quality-policy.mjs';

const execute = promisify(execFile);
const repo = resolve('.');

test('quality CLI requires references and clears stale completion on preflight failure', async () => {
  await mkdir(resolve(repo, 'runs'), { recursive: true });
  const target = await mkdtemp(resolve(repo, 'runs/quality-missing-'));
  await writeFile(resolve(target, 'QUALITY-RESULT.json'), JSON.stringify({ status: 'COMPLETE' }));
  await assert.rejects(execute(process.execPath, ['scripts/quality.mjs', target, '0'], { cwd: repo }), error => error.code === 1);
  assert.equal(JSON.parse(await readFile(resolve(target, 'QUALITY-RESULT.json'), 'utf8')).status, 'INCOMPLETE');
  await assert.rejects(access(resolve(target, '.quality-lock')));
});

test('startup publication failure releases the target lock', async () => {
  const target = await mkdtemp(resolve(repo, 'runs/quality-startup-'));
  await mkdir(resolve(target, 'UI-STATUS.md'));
  await assert.rejects(execute(process.execPath, ['scripts/quality.mjs', target, '0'], { cwd: repo }), error => error.code === 1);
  await assert.rejects(access(resolve(target, '.quality-lock')));
});

test('quality CLI runs real browser checks and requires four image reviews before completion', async () => {
  const target = await mkdtemp(resolve(repo, 'runs/quality-cli-'));
  const source = resolve(repo, 'evals/results/unattended/visual-polish');
  for (const file of ['index.html', 'styles.css', 'app.js', 'DESIGN.md', 'REFERENCE.md']) await copyFile(resolve(source, 'source', file), resolve(target, file));
  for (const view of ['desktop', 'mobile']) await copyFile(resolve(source, `${view}.png`), resolve(target, `${view}-reference.png`));
  await writeFile(resolve(target, 'QUALITY.json'), JSON.stringify({ version: 1, observations: 'Preserve the supplied document collection hierarchy and compact actions.', references: { desktop: 'desktop-reference.png', mobile: 'mobile-reference.png' } }));
  let reviews = 0;
  const server = createServer(async (request, response) => {
    let body = ''; for await (const part of request) body += part;
    const data = JSON.parse(body);
    response.setHeader('content-type', 'application/json');
    if (request.url === '/api/show') return response.end(JSON.stringify({ capabilities: ['vision'] }));
    assert.equal(request.url, '/api/chat');
    assert.equal(data.messages[1].images.length, 2);
    reviews++;
    response.end(JSON.stringify({ done_reason: 'stop', message: { content: JSON.stringify({ criteria: criteria.map(id => ({ id, score: 4, confidence: 0.95, observation: 'Reference and current preserve the required visual relationships.' })), issues: [] }) } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await execute(process.execPath, ['scripts/quality.mjs', target, '0'], { cwd: repo, env: { ...process.env, OLLAMA_URL: `http://127.0.0.1:${server.address().port}`, QWEN_DESIGN_CHECKS: '1', QWEN_REVIEW_MODEL: 'mock-vision' }, timeout: 90000, maxBuffer: 1024 * 1024 });
    const result = JSON.parse(await readFile(resolve(target, 'QUALITY-RESULT.json'), 'utf8'));
    assert.equal(result.status, 'COMPLETE');
    assert.equal(result.inspection.functional.passed, 25);
    assert.equal(result.confirmation.binding, result.inspection.binding);
    assert.equal(reviews, 4);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
