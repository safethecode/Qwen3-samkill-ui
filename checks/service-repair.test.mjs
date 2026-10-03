import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

test('service repair preserves measured partial progress across separate runs without claiming completion', async () => {
  const root = await mkdtemp(resolve('runs/service-staged-repair-'));
  const target = resolve(root, 'source');
  await mkdir(target);
  const original = '<html><head><style>body{font:500 16px sans-serif}button,input{font:inherit}</style></head><body><h1>일정 편집</h1><h2>Day 1</h2><button disabled>완료</button><input id="a"><input id="b"></body></html>';
  for (const [name, content] of Object.entries({ 'index.html': original, 'app.js': '', 'styles.css': '', 'DESIGN.md': 'Use visible input labels.', 'REFERENCE.md': 'Keep the itinerary heading and completion action.' })) await writeFile(resolve(target, name), content);
  let request = 0;
  const server = createServer(async (req, res) => {
    for await (const chunk of req) void chunk;
    const id = request++ === 0 ? 'a' : 'b';
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ model: 'test', done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'index.html', oldString: `<input id="${id}">`, newString: `<label for="${id}">Field ${id}</label><input id="${id}">` }] }) } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const run = rounds => promisify(execFile)(process.execPath, ['scripts/service-repair.mjs', target, 'round-01', String(rounds)], { env: { ...process.env, OLLAMA_URL: `http://127.0.0.1:${server.address().port}` }, windowsHide: true });
  try {
    await assert.rejects(run(1));
    assert.match(await readFile(resolve(target, 'index.html'), 'utf8'), /Field a/);
    const first = (await readdir(root)).find(name => name.startsWith('repair-'));
    const failed = JSON.parse(await readFile(resolve(root, first, 'result.json'), 'utf8'));
    assert.equal(failed.status, 'INCOMPLETE');
    assert.equal(failed.rolledBackPending, false);
    assert.equal(failed.events[0].accepted, true);
    assert.equal(failed.report.measurements['labels-390'], 1);
    await run(1);
    const source = await readFile(resolve(target, 'index.html'), 'utf8');
    assert.ok(source.includes('Field a') && source.includes('Field b'));
    const second = (await readdir(root)).find(name => name.startsWith('repair-') && name !== first);
    const passed = JSON.parse(await readFile(resolve(root, second, 'result.json'), 'utf8'));
    assert.equal(passed.status, 'FUNCTIONAL_PASS');
    assert.equal(passed.events[0].accepted, true);
    assert.equal(passed.rolledBackPending, false);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
