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

test('interface retry receives rejected source and the exact error', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qwen-interface-retry-'));
  const target = join(root, 'source'); const evidence = join(root, 'evidence');
  await mkdir(target); await mkdir(evidence);
  await writeFile(join(target, 'DESIGN.md'), 'Keep the working search input.');
  await writeFile(join(target, 'REFERENCE.md'), 'A booking form.');
  const rejected = '<html><body><input id="search"><section id="booking-form"></section></body></html>';
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
