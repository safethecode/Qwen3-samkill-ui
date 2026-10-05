import test from 'node:test';
import assert from 'node:assert/strict';
import { validateComponentPlan, validateComponent, assembleComponents, scopeComponentCss } from '../scripts/component-plan.mjs';
import { generateComponents } from '../scripts/generate-components.mjs';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const plan = { shared: 'Preserve reference grouping.', sharedCss: '.frame{max-width:390px;margin:auto}', reference: { status: 'inspected', source: 'supplied reference' }, assembly: '<main class="frame">{{E1}}{{E2}}</main>', elements: [{ id: 'E1', prompt: 'Title', assets: [], sample: '<main class="frame">{{E1}}</main>' }, { id: 'E2', prompt: 'Search', assets: [], sample: '<main class="frame">{{E2}}</main>' }] };
const title = { html: '<h1 data-ui-unit="E1">Title</h1>', css: '[data-ui-unit="E1"]{font-size:20px}' };
const search = { html: '<div data-ui-unit="E2"><label for="search">Search</label><input id="search"></div>', css: '[data-ui-unit="E2"] input{min-width:0}' };

test('semantic slots assemble exactly the same validated component source used by samples', () => {
  validateComponentPlan(plan);
  validateComponent(plan.elements[0], title);
  validateComponent(plan.elements[1], search);
  const output = assembleComponents(plan, { E1: title, E2: search });
  assert.ok(output.html.includes(title.html));
  assert.ok(output.samples.E2.includes(search.html));
  assert.ok(output.css.includes(title.css));
  assert.throws(() => validateComponentPlan({ ...plan, assembly: '{{E1}}{{E1}}' }), /slot/);
  assert.throws(() => assembleComponents(plan, { E1: title }), /Missing/);
});

test('component boundaries reject global style, hidden labels, scripts and undeclared media', () => {
  assert.throws(() => validateComponent(plan.elements[0], { ...title, css: 'body{color:red}' }), /scope/);
  assert.throws(() => validateComponent(plan.elements[0], { ...title, html: '<h1 data-ui-unit="E1" onclick="alert(1)">Title</h1>' }), /active/);
  assert.throws(() => validateComponent(plan.elements[0], { ...title, html: '<h1 data-ui-unit="E1"><img src="assets/reference/source.png"></h1>' }), /asset/);
  assert.throws(() => validateComponent(plan.elements[1], { ...search, html: '<div data-ui-unit="E2"><input id="search"></div>' }), /label/);
  assert.throws(() => validateComponent(plan.elements[1], { ...search, html: '<div data-ui-unit="E2"><label for="search" hidden>Search</label><input id="search"></div>' }), /label/);
  assert.throws(() => validateComponent(plan.elements[0], { ...title, html: '<h1 data-ui-unit="E1"><svg></svg></h1>' }), /official asset/);
});

test('host selector scoping preserves component roots and children without document escapes', () => {
  const css = scopeComponentCss(plan.elements[1], '<div data-ui-unit="E2" class="root"><input class="field"></div>', '.root{display:flex}.field::placeholder{color:black}');
  assert.match(css, /\[data-ui-unit="E2"\]\.root/);
  assert.match(css, /\[data-ui-unit="E2"\] \.field::placeholder/);
  assert.equal(scopeComponentCss(plan.elements[0], title.html, 'h1{color:black}'), '[data-ui-unit="E1"]{color:black}');
  assert.throws(() => scopeComponentCss(plan.elements[1], search.html, 'body{margin:0}'), /document scope/);
  assert.throws(() => scopeComponentCss(plan.elements[1], search.html, '[data-ui-unit="E2"] + main{color:red}'), /sibling/);
  assert.throws(() => scopeComponentCss(plan.elements[1], search.html, '.day-group + .day-group{margin-top:40px}'), /\.day-group \+ \.day-group.*parent gap/);
});

test('component generation resumes fixed element outputs and rejects changed decomposition', async () => {
  const generationPlan = { ...plan, elements: plan.elements.map(element => element.id === 'E2' ? { ...element, html: search.html } : element) };
  const root = await mkdtemp(join(tmpdir(), 'qwen-components-'));
  const target = join(root, 'source');
  const evidence = join(root, 'evidence');
  await mkdir(join(target, 'design'), { recursive: true });
  await writeFile(join(target, 'DESIGN.md'), 'Prototype.');
  await writeFile(join(target, 'REFERENCE.md'), 'Reference.');
  await writeFile(join(target, 'design/typography.json'), JSON.stringify({ roles: [{ selector: 'body *', families: ['Arial'] }] }));
  await writeFile(join(target, 'design/component-plan.json'), JSON.stringify(generationPlan));
  await writeFile(join(target, 'design/layout-contract.json'), JSON.stringify({ rules: [{ id: 'screen-purpose', kind: 'below', subject: '#summary', reference: '#title' }] }));
  let fail = true;
  const calls = [];
  const fetcher = async (_url, options) => {
    const request = JSON.parse(options.body);
    const input = request.messages[1].content;
    assert.match(input, /GENERATION GUIDE reference-to-ui\/references\/typography.md/);
    assert.match(input, /GENERATION GUIDE reference-to-ui\/references\/mobile.md/);
    assert.match(input, /DECLARED CROSS-COMPONENT RELATIONS/);
    assert.match(input, /screen-purpose/);
    const id = /ONE ELEMENT (E\d)/.exec(input)[1];
    calls.push(id);
    if (id === 'E1') assert.ok(!input.includes('ONE ELEMENT E2'));
    if (id === 'E2') { assert.match(input, /IMMUTABLE COMPONENT HTML/); assert.equal(request.format.properties.html, undefined); assert.match(request.messages[0].content, /Never use \+ or ~/); }
    if (id === 'E2' && fail) throw new Error('Injected failure');
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify(id === 'E1' ? title : { css: search.css }) } }) };
  };
  await assert.rejects(generateComponents(target, evidence, { fetcher }), /Injected failure/);
  await writeFile(join(target, 'design/component-plan.json'), JSON.stringify({ ...generationPlan, shared: 'Changed' }));
  await assert.rejects(generateComponents(target, evidence, { fetcher, resume: true }), /checkpoint/);
  await writeFile(join(target, 'design/component-plan.json'), JSON.stringify(generationPlan));
  fail = false;
  await generateComponents(target, evidence, { fetcher, resume: true });
  assert.equal(calls.filter(id => id === 'E1').length, 1);
  assert.ok((await readFile(join(target, 'index.html'), 'utf8')).includes(search.html));
  assert.ok((await readFile(join(target, 'sample-E2.html'), 'utf8')).includes(search.html));
});
