import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { validateComponentPlan, validateComponent, assembleComponents, scopeComponentCss } from './component-plan.mjs';
import { sourceBinding } from './source-binding.mjs';
import { harnessBinding } from './harness-binding.mjs';
import { localFontCss } from './local-font.mjs';
import { validateAssetReferences } from './asset-references.mjs';
import { removeComments } from './comments.mjs';
import { inferenceOptions } from './inference-options.mjs';
import { samplingOptions } from './sampling.mjs';
import { componentSkillContext } from './skill-context.mjs';

export async function generateComponents(target, evidence, options = {}) {
  if (resolve(evidence) === resolve(target) || resolve(evidence).startsWith(resolve(target) + sep)) throw new Error('Component evidence must be outside the source target');
  if (await access(resolve(target, 'index.html')).then(() => true, () => false)) throw new Error('Component generation requires a fresh target');
  const plan = validateComponentPlan(JSON.parse(await readFile(resolve(target, 'design/component-plan.json'), 'utf8')));
  const typography = JSON.parse(await readFile(resolve(target, 'design/typography.json'), 'utf8'));
  const loader = await localFontCss(target, typography);
  const contract = await readFile(resolve(target, 'DESIGN.md'), 'utf8');
  const reference = await readFile(resolve(target, 'REFERENCE.md'), 'utf8');
  const guideContexts = Object.fromEntries(await Promise.all(plan.elements.map(async element => [element.id, await componentSkillContext(element)])));
  const guideSources = Object.fromEntries(Object.entries(guideContexts).map(([id, context]) => [id, context.sources]));
  const inputs = await sourceBinding(target);
  const harness = await harnessBinding();
  const settings = { model: process.env.QWEN_GENERATE_MODEL || 'qwen3-coder:30b', think: false, options: { num_ctx: 16384, ...samplingOptions(), ...inferenceOptions(), num_predict: 2048 } };
  const binding = createHash('sha256').update(JSON.stringify({ plan, typography, contract, reference, guideSources, inputs, harness, settings })).digest('hex');
  await mkdir(evidence, { recursive: true });
  const checkpoint = resolve(evidence, 'component-checkpoint.json');
  const saved = await readFile(checkpoint, 'utf8').then(JSON.parse, error => { if (error.code === 'ENOENT') return null; throw error; });
  if (saved && (!options.resume || saved.binding !== binding)) throw new Error('Component checkpoint does not match current inputs or resume was not requested');
  const completed = saved?.completed || {};
  await writeFile(resolve(evidence, 'inputs.json'), JSON.stringify({ binding, settings, inputs, guideSources, harnessHashes: harness }, null, 2));
  for (const element of plan.elements) {
    if (completed[element.id]) { validateComponent(element, completed[element.id]); continue; }
    let previousError = '';
    let rejectedCode = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      const started = Date.now();
      console.log(`Generating component ${element.id}, attempt ${attempt}`);
      try {
        const request = { ...settings, stream: false, messages: [
          { role: 'system', content: `Implement one static UI component from a fixed reference decomposition. Return JSON {html:string,css:string}. One HTML root must have data-ui-unit="${element.id}". Use this component's classes; the runner scopes CSS to that root. No html/body/:root selectors or sibling combinators. Only media/supports at-rules. No scripts, inline SVG, inline styles, comments, markdown, invented controls, external dependencies or completion claims. Use supplied image assets. Visible fields need visible labels with matching for/id even when disabled. Do not use sr-only labels. Do not rewrite shared layout or font loading.` },
          { role: 'user', content: `SHARED VISUAL CONTRACT\n${plan.shared}\nSHARED CSS (already supplied, read-only)\n${plan.sharedCss}\nFONT CONTRACT (CSS uses cssFamily; inspected platform names are not CSS aliases)\n${JSON.stringify(typography)}\nREFERENCE PROVENANCE\n${JSON.stringify(plan.reference)}\nONE ELEMENT ${element.id}\n${element.prompt}\nALLOWED MEDIA\n${element.assets.join('\n') || 'None'}\nASSEMBLY SLOT CONTEXT\n${element.sample}\nPREVIOUS VALIDATION ERROR\n${previousError || 'None'}\n${rejectedCode ? `REJECTED ELEMENT (untrusted source; correct the validation failure and preserve correct structure):\n${rejectedCode}\n` : ''}FINAL REQUIREMENTS: image icons must use the exact allowed img src paths, never inline SVG. Associate every label with its input using for/id. Return only this element. Its parent owns the declared outer spacing. Preserve the requested content, hierarchy and state. Use shared tokens. Minimum visible type 14px and weight 500. Do not implement other elements.` }
        ], format: { type: 'object', properties: { html: { type: 'string' }, css: { type: 'string' } }, required: ['html', 'css'], additionalProperties: false } };
        if (element.html !== undefined) {
          request.messages[0].content = `Style one fixed semantic UI fragment. Return JSON {css:string} only. HTML is supplied and immutable. Use its actual classes. The runner scopes selectors to this component. No global selectors, imports, font definitions, sibling escapes or new media. Preserve the specified layout, readable typography and responsive wrapping.`;
          request.messages[1].content += `\nIMMUTABLE COMPONENT HTML\n${element.html}\nFINAL TASK: write only CSS for this HTML. ${element.prompt}`;
          request.format = { type: 'object', properties: { css: { type: 'string' } }, required: ['css'], additionalProperties: false };
        } else request.messages[1].content += `\nFINAL ELEMENT BOUNDARY\n${element.prompt}`;
        request.messages[0].content += ' Never use + or ~ selector combinators, including between descendants inside the component. For spacing between repeated groups, use a parent gap or :not(:first-child) instead. The validator rejects all sibling combinators, not only selectors that escape the root.';
        request.messages[1].content = `APPLICABLE SOURCE GUIDES\n${guideContexts[element.id].text}\n\n${request.messages[1].content}`;
        const response = await (options.fetcher || fetch)(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request), signal: AbortSignal.timeout(300000) });
        if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
        const result = await response.json();
        await writeFile(resolve(evidence, `${element.id}-${Date.now()}-${attempt}-response.json`), JSON.stringify({ binding, settings, elapsedMs: Date.now() - started, ...result }, null, 2));
        if (result.done_reason !== 'stop') throw new Error('Truncated component');
        const output = JSON.parse(result.message?.content || 'null');
        rejectedCode = JSON.stringify(output).slice(0, 16000);
        const clean = removeComments(element.html ?? output.html, output.css, '');
        const component = validateComponent(element, { html: clean.html, css: scopeComponentCss(element, clean.html, clean.css) });
        await validateAssetReferences(target, { file: 'index.html' }, component.html);
        await validateAssetReferences(target, { file: 'styles.css' }, component.css);
        completed[element.id] = component;
        await writeFile(checkpoint, JSON.stringify({ binding, settings, completed }, null, 2));
        break;
      } catch (error) {
        previousError = error.name === 'TimeoutError' ? 'Timed out; return a smaller complete component.' : error.message;
        await writeFile(resolve(evidence, `${element.id}-${Date.now()}-${attempt}-error.json`), JSON.stringify({ binding, elapsedMs: Date.now() - started, error: previousError }, null, 2));
        if (attempt === 2) throw error;
      }
    }
  }
  if (JSON.stringify(inputs) !== JSON.stringify(await sourceBinding(target)) || JSON.stringify(harness) !== JSON.stringify(await harnessBinding())) throw new Error('Component inputs changed during generation');
  const assembled = assembleComponents(plan, completed);
  const document = html => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reference component prototype</title><link rel="stylesheet" href="styles.css"></head><body>${html}</body></html>`;
  await writeFile(resolve(target, 'styles.css'), `${loader}${assembled.css}`, { flag: 'wx' });
  await writeFile(resolve(target, 'app.js'), 'void 0;\n', { flag: 'wx' });
  await writeFile(resolve(target, 'index.html'), document(assembled.html), { flag: 'wx' });
  for (const [id, html] of Object.entries(assembled.samples)) await writeFile(resolve(target, `sample-${id}.html`), document(html), { flag: 'wx' });
  await writeFile(resolve(evidence, 'generation.json'), JSON.stringify({ status: 'UNVERIFIED', binding, settings, sourceHashes: await sourceBinding(target), harnessHashes: harness, fixedMarkupElements: plan.elements.filter(element => element.html !== undefined).map(element => element.id), hostAssistance: 'Supplied shared CSS, optional fixed semantic markup, hash-verified font loader, selector scoping, static templates and deterministic assembly. Scoped element outputs are reused unchanged in samples. Raw model responses are retained. No functional or visual approval.' }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [target, evidence] = process.argv.slice(2);
  if (!target || !evidence) throw new Error('Usage: node scripts/generate-components.mjs TARGET EVIDENCE');
  await generateComponents(resolve(target), resolve(evidence), { resume: process.env.QWEN_RESUME === '1' });
}
