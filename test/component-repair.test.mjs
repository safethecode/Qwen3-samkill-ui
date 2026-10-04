import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repairComponent } from '../scripts/repair-component.mjs';

const component = { html: '<div data-ui-unit="A">Title</div>', css: '[data-ui-unit="A"]{font-size:12px}' };
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'component-repair-'));
  const target = join(root, 'source');
  await mkdir(join(target, 'design'), { recursive: true });
  await writeFile(join(target, 'design/component-plan.json'), JSON.stringify({ shared: 'Minimum14px.', sharedCss: '', reference: { status: 'inspected', source: 'fixture' }, assembly: '{{A}}', elements: [{ id: 'A', prompt: 'Title', assets: [], sample: '{{A}}' }] }));
  for (const file of ['index.html', 'sample-A.html']) await writeFile(join(target, file), component.html);
  await writeFile(join(target, 'styles.css'), component.css);
  await writeFile(join(target, 'app.js'), 'void 0;');
  return { target, evidence: join(root, 'evidence') };
}
const reply = patches => ({ ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ patches }) } }) });

test('bounded component repair reuses HTML across sample and assembly without touching behavior', async () => {
  const { target, evidence } = await fixture();
  await repairComponent(target, evidence, 'A', component, 'Change Title to Heading', { fetcher: async () => reply([{ field: 'html', oldString: 'Title', newString: 'Heading' }]) });
  assert.equal(await readFile(join(target, 'index.html'), 'utf8'), await readFile(join(target, 'sample-A.html'), 'utf8'));
  assert.match(await readFile(join(target, 'index.html'), 'utf8'), /Heading/);
  assert.equal(await readFile(join(target, 'app.js'), 'utf8'), 'void 0;');
});

test('invalid scope and stale source are rejected before any repair writes', async () => {
  for (const mode of ['scope', 'stale', 'truncated']) {
    const { target, evidence } = await fixture();
    await assert.rejects(repairComponent(target, evidence, 'A', component, 'Fix type', { fetcher: async () => {
      if (mode === 'stale') await writeFile(join(target, 'app.js'), 'userChange();');
      if (mode === 'truncated') return { ok: true, json: async () => ({ done_reason: 'length' }) };
      return reply([{ field: 'css', oldString: component.css, newString: mode === 'scope' ? 'body{color:red}' : '[data-ui-unit="A"]{font-size:14px}' }]);
    } }));
    assert.equal(await readFile(join(target, 'styles.css'), 'utf8'), component.css);
    assert.equal(await readFile(join(target, 'index.html'), 'utf8'), component.html);
  }
});
