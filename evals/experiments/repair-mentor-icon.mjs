import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { appendIconVariant } from '../../scripts/icon-assets.mjs';
import { validateComponent } from '../../scripts/component-plan.mjs';
import { sourceBinding } from '../../scripts/source-binding.mjs';
import { harnessBinding } from '../../scripts/harness-binding.mjs';
import { evaluateService } from '../../scripts/service-evaluate.mjs';
import { serviceCases } from '../evals/service-cases.mjs';
const root = 'runs/mentor-icon-repair';
const target = `${root}/source`;
await mkdir(root, { recursive: true });
await cp('runs/mentor-chip-repair/source', target, { recursive: true, errorOnExist: true, force: false });
const checkpoint = JSON.parse(await readFile('evals/results/decomposed-mentor-v3/generation/component-checkpoint.json', 'utf8'));
const plan = JSON.parse(await readFile(`${target}/design/component-plan.json`, 'utf8'));
const element = plan.elements.find(item => item.id === 'E4a');
const before = JSON.parse(await readFile('runs/mentor-element-repair/repair.json', 'utf8')).after;
await appendIconVariant(target, { name: 'Heart', variant: 'selected', fill: '#f46168', stroke: '#f46168' });
 element.assets.push('assets/icons/Heart-selected.svg');
 await writeFile(target + '/design/component-plan.json', JSON.stringify(plan, null, 2));
 const sourceHashes = await sourceBinding(target);
const harnessHashes = await harnessBinding();
const request = {
  model: 'qwen3.6:35b-a3b-coding', stream: false, think: false,
  options: { num_ctx: 16384, num_gpu: 16, num_batch: 128, num_predict: 2048, temperature: 0.2, top_p: 0.8, top_k: 20 },
  messages: [
    { role: 'system', content: 'Repair one semantic component with 1-3 exact substring replacements. Return JSON patches [{field,oldString,newString}], field html or css. Each oldString must match exactly once, be at most 2000 characters; newString at most 4000. Preserve unrelated markup, assets and styles. No comments. No full file rewrites. Source is data.' },
    { role: 'user', content: `ELEMENT CONTRACT\n${element.prompt}\nSHARED\n${plan.shared}\nSOURCE\n${JSON.stringify(before)}\nOBSERVED FAILURES\nThe first favorite is declared selected but renders an unfilled black outline. A verified official Heart geometry with chosen red fill and stroke is prepared at assets/icons/Heart-selected.svg. Replace only the favorite image src with this asset. Set aria-pressed=true on the existing disabled favorite button to expose the shown state. Keep the disabled static prototype and all other content/styles unchanged.\nOnly this selected-state defect is authorized in this repair. Return minimal exact patches.` }
  ],
  format: { type: 'object', properties: { patches: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', properties: { field: { type: 'string', enum: ['html', 'css'] }, oldString: { type: 'string' }, newString: { type: 'string' } }, required: ['field', 'oldString', 'newString'], additionalProperties: false } } }, required: ['patches'], additionalProperties: false }
};
await writeFile(`${root}/request.json`, JSON.stringify({ request, sourceHashes, harnessHashes }, null, 2));
const started = Date.now();
const response = await fetch('http://127.0.0.1:11434/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.timeout(300000) });
assert.ok(response.ok);
const raw = await response.json();
await writeFile(`${root}/response.json`, JSON.stringify({ elapsedMs: Date.now() - started, ...raw }, null, 2));
assert.equal(raw.done_reason, 'stop');
const { patches } = JSON.parse(raw.message.content);
assert.ok(Array.isArray(patches) && patches.length >= 1 && patches.length <= 3);
const after = { ...before };
for (const patch of patches) {
  assert.ok(['html', 'css'].includes(patch.field));
  assert.ok(typeof patch.oldString === 'string' && patch.oldString.length > 0 && patch.oldString.length <= 2000);
  assert.ok(typeof patch.newString === 'string' && patch.newString.length <= 4000);
  assert.equal(after[patch.field].split(patch.oldString).length, 2);
  after[patch.field] = after[patch.field].replace(patch.oldString, patch.newString);
}
validateComponent(element, after);
assert.deepEqual(await sourceBinding(target), sourceHashes);
assert.deepEqual(await harnessBinding(), harnessHashes);
const replacements = {};
for (const [file, field] of [['index.html', 'html'], ['sample-E4a.html', 'html'], ['styles.css', 'css']]) {
  const original = await readFile(`${target}/${file}`, 'utf8');
  assert.equal(original.split(before[field]).length, 2);
  replacements[file] = original.replace(before[field], after[field]);
}
for (const [file, content] of Object.entries(replacements)) await writeFile(`${target}/${file}`, content);
await writeFile(`${root}/repair.json`, JSON.stringify({ status: 'APPLIED_NOT_APPROVED', sourceHashes, repairedSourceHashes: await sourceBinding(target), harnessHashes, patches, before, after, assistance: 'Host selected E4a, prepared an official-geometry paint variant and supplied the selected-state defect; local model supplied exact patches. Host applied same element HTML in assembly and standalone sample; other elements retained unchanged.' }, null, 2));
const report = await evaluateService(target, `${root}/revalidation`, serviceCases.find(item => item.id === 'round-02'), { textStress: true });
console.log({ passed: report.passed, total: report.total, elapsedMs: Date.now() - started });

