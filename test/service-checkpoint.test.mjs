import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateService } from '../scripts/generate-service.mjs';

test('interrupted service generation resumes only unchanged, validated completed stages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-service-checkpoint-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'A small test service.');
  await writeFile(join(target, 'REFERENCE.md'), 'A simple visible heading.');
  const parts = { shell: '<html><body><h1>Test</h1></body></html>', state: 'let count = 0;', behavior: 'count += 1;', forms: 'count += 2;', layout: 'body {margin:0}', responsive: '@media(max-width:400px){body{padding:16px}}' };
  const calls = [];
  let fail = true;
  const fetcher = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.ok(request.messages[1].content.includes('Choose the dominant structure from the task'));
    const id = /CURRENT UNIT: (\w+)/.exec(request.messages[1].content)[1];
    calls.push(id);
    if (fail && id === 'state') throw new DOMException('timeout', 'TimeoutError');
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: parts[id] }) } }) };
  };
  await assert.rejects(generateService(target, evidence, { fetcher }), { name: 'TimeoutError' });
  assert.deepEqual(calls, ['shell', 'state', 'state']);
  assert.deepEqual(Object.keys(JSON.parse(await readFile(join(evidence, 'generation-checkpoint.json'), 'utf8')).completed), ['shell']);
  fail = false;
  await generateService(target, evidence, { fetcher, resume: true });
  assert.equal(calls.filter(id => id === 'shell').length, 1);
  assert.equal(await readFile(join(target, 'app.js'), 'utf8'), 'let count = 0;\ncount += 1;\ncount += 2;');
});

test('changed contracts invalidate resumable generation checkpoints', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-stale-checkpoint-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Current contract');
  await writeFile(join(target, 'REFERENCE.md'), 'Current reference');
  await writeFile(join(evidence, 'generation-checkpoint.json'), JSON.stringify({ binding: 'stale', completed: { shell: '<html></html>' } }));
  await assert.rejects(generateService(target, evidence, { resume: true, fetcher: async () => { throw new Error('Should not call model'); } }), /does not match/);
});

test('missing field labels are repaired in the shell before any implementation unit', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-label-retry-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Visible search label.');
  await writeFile(join(target, 'REFERENCE.md'), 'Search the catalogue.');
  const calls = [];
  const fetcher = async (_url, options) => {
    const content = JSON.parse(options.body).messages[1].content;
    const id = /CURRENT UNIT: (\w+)/.exec(content)[1];
    calls.push(id);
    if (id !== 'shell') throw new Error('Stop after label validation');
    const second = calls.length === 2;
    if (second) assert.match(content, /#search requires a nonempty visible label/);
    const code = `<html><body>${second ? '<label for="search">Search</label>' : ''}<input id="search" placeholder="Search"></body></html>`;
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code }) } }) };
  };
  await assert.rejects(generateService(target, evidence, { fetcher, interface: { search: 'input' } }), /Stop after label validation/);
  assert.deepEqual(calls.slice(0, 3), ['shell', 'shell', 'state']);
  assert.match(JSON.parse(await readFile(join(evidence, 'generation-checkpoint.json'), 'utf8')).completed.shell, /<label/);
});

test('interface retry receives rejected source and the exact error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-interface-retry-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Keep the working search input.');
  await writeFile(join(target, 'REFERENCE.md'), 'A booking form.');
  const rejected = '<html><body><label for="search">Search</label><input id="search"><section id="booking-form"></section></body></html>';
  let shells = 0;
  const fetcher = async (_url, options) => {
    const content = JSON.parse(options.body).messages[1].content;
    const id = /CURRENT UNIT: (\w+)/.exec(content)[1];
    if (id !== 'shell') throw new Error('Stop after verified shell');
    shells++;
    if (shells === 2) {
      assert.ok(content.includes(rejected));
      assert.ok(content.includes('must be <form>, received <section>'));
      assert.ok(content.includes('Preserve its already-correct IDs'));
    }
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: shells === 1 ? rejected : rejected.replaceAll('section', 'form') }) } }) };
  };
  await assert.rejects(generateService(target, evidence, { fetcher, interface: { search: 'input', 'booking-form': 'form' } }), /Stop after verified shell/);
  assert.equal(shells, 2);
  const saved = JSON.parse(await readFile(join(evidence, 'generation-checkpoint.json'), 'utf8'));
  assert.ok(saved.completed.shell.includes('<input id="search">'));
});

test('static translation stages do not request product behavior and cannot resume as an interactive flow', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-static-stages-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Static translation with disabled example controls.');
  await writeFile(join(target, 'REFERENCE.md'), 'Two reference cards.');
  const instructions = {};
  const fetcher = async (_url, options) => {
    const content = JSON.parse(options.body).messages[1].content;
    const [, id, instruction] = /CURRENT UNIT: (\w+)\n([\s\S]*?)\nPREVIOUS ERROR:/.exec(content);
    instructions[id] = instruction;
    if (id === 'layout') throw new Error('Stop before layout');
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: id === 'shell' ? '<html><body><h1>Static</h1></body></html>' : 'function renderStaticView() {}' }) } }) };
  };
  await assert.rejects(generateService(target, evidence, { fetcher, flow: 'static' }), /Stop before layout/);
  assert.doesNotMatch(instructions.state, /safe localStorage loading\/saving/);
  assert.equal(instructions.behavior, undefined);
  assert.equal(instructions.forms, undefined);
  for (const id of ['shell', 'state']) assert.match(instructions[id], /STATIC TRANSLATION/);
  await assert.rejects(generateService(target, evidence, { flow: 'booking', resume: true, fetcher: async () => { throw new Error('Unexpected model request'); } }), /does not match/);
});

test('static lifecycle calls the renderer and disables sample actions without asking the model for forms', async () => {
  const { runInNewContext } = await import('node:vm');
  const root = await mkdtemp(join(tmpdir(), 'qwen-static-lifecycle-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Static cards and disabled buttons.');
  await writeFile(join(target, 'REFERENCE.md'), 'Two cards.');
  const calls = [];
  const parts = { shell: '<html><body><main id="cards"></main></body></html>', state: 'function renderStaticView() { globalThis.rendered = true; }', behavior: 'void 0;', forms: 'void 0;', layout: 'body{margin:0}', responsive: '[hidden]{display:none!important}' };
  const fetcher = async (_url, options) => {
    const id = /CURRENT UNIT: (\w+)/.exec(JSON.parse(options.body).messages[1].content)[1];
    calls.push(id);
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: parts[id] }) } }) };
  };
  await generateService(target, evidence, { flow: 'static', fetcher });
  const button = { disabled: false };
  const context = { document: { querySelectorAll: () => [button] } };
  runInNewContext(await readFile(join(target, 'app.js'), 'utf8'), context);
  assert.equal(context.rendered, true);
  assert.equal(button.disabled, true);
  assert.deepEqual(calls, ['shell', 'state', 'layout', 'responsive']);
});

test('JavaScript retries name the required language and do not repeat the HTML construction checklist', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-stage-language-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Static cards.');
  await writeFile(join(target, 'REFERENCE.md'), 'A card list.');
  let retries = 0;
  const fetcher = async (_url, options) => {
    const request = JSON.parse(options.body);
    const content = request.messages[1].content;
    const id = /CURRENT UNIT: (\w+)/.exec(content)[1];
    if (id === 'shell') return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({code:'<html><body><h1>Cards</h1></body></html>'}) } }) };
    if (id !== 'state') throw new Error('Stop after corrected JavaScript');
    retries++;
    assert.match(content.split('FINAL OUTPUT CONTRACT').at(-1), /JavaScript.*app\.js/);
    assert.ok(!content.includes('FINAL REQUIRED ELEMENT CHECKLIST'));
    if (retries === 2) assert.match(content, /state requires JavaScript for app\.js; received HTML/);
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({code:retries === 1 ? '<html></html>' : 'function renderStaticView() {}'}) } }) };
  };
  await assert.rejects(generateService(target,evidence,{flow:'static',fetcher}),/Stop after corrected JavaScript/);
  assert.equal(retries,2);
});
