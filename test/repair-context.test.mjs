import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { repair } from '../scripts/repair.mjs';

test('a JavaScript repair sees the existing DOM and CSS while retaining its write scope', async () => {
  await mkdir('runs', { recursive: true });
  const target = await mkdtemp(resolve('runs/repair-context-'));
  const evidence = resolve(target, 'evidence');
  await mkdir(evidence);
  for (const [name, content] of Object.entries({ 'index.html': '<button id="actual-button" class="actual-action">Open</button>', 'styles.css': '.actual-action { color: blue; }', 'app.js': 'const state = "before";', 'DESIGN.md': 'Show an example label.' })) await writeFile(resolve(target, name), content);
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return { ok: true, json: async () => ({ model: 'mock', done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'app.js', oldString: '"before"', newString: '"after"' }] }) } }) };
  };
  try { await repair(target, evidence, { name: 'three-example-documents', detail: 'Example label is not rendered.' }); }
  finally { globalThis.fetch = originalFetch; }
  const context = request.messages.find(message => message.role === 'user').content;
  assert.ok(context.includes('<button id="actual-button"'));
  assert.ok(context.includes('.actual-action { color: blue; }'));
  assert.deepEqual(request.format.properties.patches.items.properties.path.enum, ['app.js']);
  assert.equal(await readFile(resolve(target, 'app.js'), 'utf8'), 'const state = "after";');
  assert.equal(await readFile(resolve(target, 'index.html'), 'utf8'), '<button id="actual-button" class="actual-action">Open</button>');
});

test('syntactically broken patches are rejected before changing application files', async () => {
  await mkdir('runs', { recursive: true });
  const target = await mkdtemp(resolve('runs/repair-syntax-'));
  const evidence = resolve(target, 'evidence');
  await mkdir(evidence);
  for (const [name, content] of Object.entries({ 'index.html': '<html></html>', 'styles.css': 'body { color: black; }', 'app.js': 'const state = "before";', 'DESIGN.md': 'Show an example badge.' })) await writeFile(resolve(target, name), content);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ model: 'mock', done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'app.js', oldString: '"before"', newString: '(' }] }) } }) });
  try { await assert.rejects(repair(target, evidence, { name: 'three-example-documents', detail: 'Missing sample badge.' }), /Invalid complete file app.js/); }
  finally { globalThis.fetch = originalFetch; }
  assert.equal(await readFile(resolve(target, 'app.js'), 'utf8'), 'const state = "before";');
});

test('quality escalation explicitly requests validated complete affected files', async () => {
  const target = await mkdtemp(resolve('runs/repair-mode-'));
  const evidence = resolve(target, 'evidence');
  await mkdir(evidence);
  for (const [name, content] of Object.entries({ 'index.html': '<html></html>', 'styles.css': 'body { color: black; }', 'app.js': 'const state = 1;', 'DESIGN.md': 'Preserve the document layout.' })) await writeFile(resolve(target, name), content);
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return { ok: true, json: async () => ({ model: 'mock', done_reason: 'stop', message: { content: JSON.stringify({ files: [{ path: 'styles.css', content: 'body { color: navy; }' }] }) } }) };
  };
  try { await repair(target, evidence, { name: 'visual-review', files: ['styles.css'], detail: 'Correct the action emphasis.' }, '', { mode: 'files' }); }
  finally { globalThis.fetch = originalFetch; }
  assert.deepEqual(request.format.properties.files.items.properties.path.enum, ['styles.css']);
  assert.equal(await readFile(resolve(target, 'styles.css'), 'utf8'), 'body { color: navy; }');
  assert.equal(await readFile(resolve(target, 'app.js'), 'utf8'), 'const state = 1;');
});

test('bounded repair overrides full-file escalation and rejects invalid source atomically', async () => {
  const target = await mkdtemp(resolve('runs/repair-unit-'));
  const evidence = resolve(target, 'evidence');
  await mkdir(evidence);
  const files = { 'index.html': '<html><button id="open">Open</button></html>', 'styles.css': 'body { color: black; }', 'app.js': 'const state = 1;', 'DESIGN.md': 'Preserve the service layout.' };
  for (const [name, content] of Object.entries(files)) await writeFile(resolve(target, name), content);
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (_url, options) => {
    request = JSON.parse(options.body);
    return { ok: true, json: async () => ({ model: 'mock', done_reason: 'stop', message: { content: JSON.stringify({ patches: [{ path: 'app.js', oldString: '1', newString: '(' }] }) } }) };
  };
  try { await assert.rejects(repair(target, evidence, { name: 'visual-review', files: ['app.js'], detail: 'Fix state rendering' }, '', { mode: 'files', bounded: true }), /Invalid complete file/); }
  finally { globalThis.fetch = originalFetch; }
  assert.equal(request.options.num_predict, 2048);
  assert.equal(request.format.properties.patches.maxItems, 1);
  assert.match(request.messages[1].content, /partial source window/);
  for (const [name, content] of Object.entries(files)) assert.equal(await readFile(resolve(target, name), 'utf8'), content);
});
