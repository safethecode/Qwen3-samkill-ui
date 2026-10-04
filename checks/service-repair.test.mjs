import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

test('service repair continues past basic passes to repair enlarged-text overflow', async () => {
  const root = await mkdtemp(resolve('runs/service-stress-repair-'));
  const target = resolve(root, 'source');
  await mkdir(target);
  const css = 'body{font:500 16px sans-serif}button{font:inherit}.row{display:flex;white-space:nowrap}';
  for (const [name, content] of Object.entries({ 'index.html': '<html><head><link rel="stylesheet" href="styles.css"></head><body><h1>일정 편집</h1><h2>Day 1</h2><div class="row"><span>Long search label</span><button disabled>완료</button></div></body></html>', 'app.js': '', 'styles.css': css, 'DESIGN.md': 'Preserve content and wrap at 200% text.', 'REFERENCE.md': 'Keep the itinerary.' })) await writeFile(resolve(target, name), content);
  let requestCount = 0;
  const server = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    const request = JSON.parse(body);
    assert.match(body, /text-200/);
    assert.deepEqual(request.format.properties.patches.items.properties.path.enum, ['styles.css']);
    requestCount++;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'styles.css', oldString: '.row{display:flex;white-space:nowrap}', newString: '.row{display:flex;flex-wrap:wrap;white-space:normal;overflow-wrap:anywhere}' }] }) } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await promisify(execFile)(process.execPath, ['scripts/service-repair.mjs', target, 'round-01', '1'], { env: { ...process.env, OLLAMA_URL: `http://127.0.0.1:${server.address().port}` }, windowsHide: true });
    assert.equal(requestCount, 1);
    const evidence = (await readdir(root)).find(name => name.startsWith('repair-'));
    const result = JSON.parse(await readFile(resolve(root, evidence, 'result.json'), 'utf8'));
    assert.equal(result.events[0].accepted, true);
    assert.match(result.events[0].failure, /^text-200-/);
    assert.equal(result.visual, 'UNVERIFIED');
    assert.ok(result.report.reviewRequired.some(finding => finding.category === 'layout'));
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('service repair preserves measured partial progress across separate runs without claiming completion', async () => {
  const root = await mkdtemp(resolve('runs/service-staged-repair-'));
  const target = resolve(root, 'source');
  await mkdir(target);
  const original = '<html><head><style>body{font:500 16px sans-serif}button,input{font:inherit;max-width:100%;box-sizing:border-box}</style></head><body><h1>일정 편집</h1><h2>Day 1</h2><button disabled>완료</button><input id="a"><input id="b"></body></html>';
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

test('staged edits without measured progress rotate to another source unit', async () => {
  const root = await mkdtemp(resolve('runs/service-rotation-'));
  const target = resolve(root, 'source');
  await mkdir(target);
  const html = '<html><head><link rel="stylesheet" href="styles.css"></head><body style="font:500 16px sans-serif"><h1>일정 편집</h1><h2>Day 1</h2><button disabled>완료</button><input id="a"></body></html>';
  for (const [name, content] of Object.entries({ 'index.html': html, 'app.js': 'void 0;', 'styles.css': 'button,input{font:inherit}', 'DESIGN.md': 'Label the input.', 'REFERENCE.md': 'Keep the itinerary.' })) await writeFile(resolve(target, name), content);
  const paths = [];
  const server = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    const request = JSON.parse(body);
    const path = request.format.properties.patches.items.properties.path.enum[0];
    paths.push(path);
    const patch = path === 'index.html' ? { path, oldString: '<input id="a">', newString: '<input id="a" data-review="pending">' } : { path, oldString: 'void 0;', newString: 'void 1;' };
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ done_reason: 'stop', message: { content: JSON.stringify({ patches: [patch] }) } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await assert.rejects(promisify(execFile)(process.execPath, ['scripts/service-repair.mjs', target, 'round-01', '2'], { env: { ...process.env, OLLAMA_URL: `http://127.0.0.1:${server.address().port}` }, windowsHide: true }));
    assert.deepEqual(paths, ['index.html', 'app.js']);
    assert.equal(await readFile(resolve(target, 'index.html'), 'utf8'), html);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('foundational typography is repaired before downstream workflow or label failures', async () => {
  const root = await mkdtemp(resolve('runs/service-typography-first-'));
  const target = resolve(root, 'source');
  await mkdir(target);
  for (const [name, content] of Object.entries({ 'index.html': '<html><head><link rel="stylesheet" href="styles.css"></head><body><h1>일정 편집</h1><h2>Day 1</h2><button disabled>완료</button><input id="a"></body></html>', 'app.js': 'void 0;', 'styles.css': 'body{font:400 16px sans-serif}button,input{font:inherit}', 'DESIGN.md': 'Minimum text weight 500 and visible labels.', 'REFERENCE.md': 'Keep the itinerary.' })) await writeFile(resolve(target, name), content);
  const paths = [];
  const server = createServer(async (req, res) => {
    let body = ''; for await (const part of req) body += part;
    paths.push(JSON.parse(body).format.properties.patches.items.properties.path.enum[0]);
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'styles.css', oldString: 'font:400 16px', newString: 'font:500 16px' }] }) } }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await assert.rejects(promisify(execFile)(process.execPath, ['scripts/service-repair.mjs', target, 'round-01', '1'], { env: { ...process.env, OLLAMA_URL: `http://127.0.0.1:${server.address().port}` }, windowsHide: true }));
    assert.deepEqual(paths, ['styles.css']);
    assert.match(await readFile(resolve(target, 'styles.css'), 'utf8'), /font:500/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
