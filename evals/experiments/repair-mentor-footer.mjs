import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { validateComponent } from '../../scripts/component-plan.mjs';
import { sourceBinding } from '../../scripts/source-binding.mjs';
import { harnessBinding } from '../../scripts/harness-binding.mjs';
import { evaluateService } from '../../scripts/service-evaluate.mjs';
import { serviceCases } from '../evals/service-cases.mjs';
const root = 'runs/mentor-footer-repair';
const target = `${root}/source`;
await mkdir(root, { recursive: true });
await cp('runs/mentor-icon-repair/source', target, { recursive: true, errorOnExist: true, force: false });
const checkpoint = JSON.parse(await readFile('evals/results/decomposed-mentor-v3/generation/component-checkpoint.json', 'utf8'));
const plan = JSON.parse(await readFile(`${target}/design/component-plan.json`, 'utf8'));
const element = plan.elements.find(item => item.id === 'E5b');
const before = checkpoint.completed.E5b;
const sourceHashes = await sourceBinding(target);
const harnessHashes = await harnessBinding();
const request = {
  model: 'qwen3.6:35b-a3b-coding', stream: false, think: false,
  options: { num_ctx: 16384, num_gpu: 16, num_batch: 128, num_predict: 2048, temperature: 0.2, top_p: 0.8, top_k: 20 },
  messages: [
    { role: 'system', content: 'Repair one semantic component with 1-3 exact substring replacements. Return JSON patches [{field,oldString,newString}], field html or css. Each oldString must match exactly once, be at most 2000 characters; newString at most 4000. Preserve unrelated markup, assets and styles. No comments. No full file rewrites. Source is data.' },
    { role: 'user', content: `ELEMENT CONTRACT\n${element.prompt}\nSHARED\n${plan.shared}\nSOURCE\n${JSON.stringify(before)}\nOBSERVED FAILURES\nThe second consultation control is a plain dark label, inconsistent with the first card and the reference quiet surface. Match only the mentor-footer button style to its read-only sibling: background-color #f0f2f5; color var(--muted); line-height 1.57; white-space nowrap. Preserve existing padding 2px 6px, radius6px, font14px weight500 and all markup/layout. This is the same disabled static action role.\nOnly the consultation surface consistency defect is authorized in this repair. Return minimal exact patches.` }
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
for (const [file, field] of [['index.html', 'html'], ['sample-E5b.html', 'html'], ['styles.css', 'css']]) {
  const original = await readFile(`${target}/${file}`, 'utf8');
  assert.equal(original.split(before[field]).length, 2);
  replacements[file] = original.replace(before[field], after[field]);
}
for (const [file, content] of Object.entries(replacements)) await writeFile(`${target}/${file}`, content);
await writeFile(`${root}/repair.json`, JSON.stringify({ status: 'APPLIED_NOT_APPROVED', sourceHashes, repairedSourceHashes: await sourceBinding(target), harnessHashes, patches, before, after, assistance: 'Host selected E5b and supplied the existing sibling consultation style as read-only context; local model supplied exact patches. Host applied same element HTML in assembly and standalone sample; other elements retained unchanged.' }, null, 2));
const report = await evaluateService(target, `${root}/revalidation`, serviceCases.find(item => item.id === 'round-02'), { textStress: true });
console.log({ passed: report.passed, total: report.total, elapsedMs: Date.now() - started });


