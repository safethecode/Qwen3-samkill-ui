import { inferenceFetch, inferenceTimeout } from './inference-http.mjs';
import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
import postcss from 'postcss';
import { samplingOptions } from './sampling.mjs';
import { inferenceOptions } from './inference-options.mjs';
import { validateInterface } from './service-interface.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const phases = {
  'index.html': 'Create the complete semantic HTML shell, visible labels, all controls and editor fields. Link styles.css and deferred app.js. Use exact labels from the contract. Required label means a visible label, not a required input: only explicitly mandatory values should block saving. Give elements stable IDs. Use a hidden editor section and an empty list container for JS rendering. Keep HTML under 120 lines.',
  'app.js': 'Implement all behavior using the exact IDs and classes of the supplied HTML. Initialize example data only when storage has no saved value, never when a saved list is empty. Keep active/archive state, search and editing ID explicit and separate. Create starts with null editing ID and clean fields; cancel clears editing ID. Update existing IDs on edit, allocate new IDs on create and duplicate. Duplicate copies all fields and gets a new ID. Filter active versus archived consistently, persist every mutation. Validate required values with visible localized errors. Render user strings using textContent or escape every HTML interpolation. Render actual document content previews and example badges when requested. Wire every visible control. Do not use browser confirm dialogs. Keep JS concise, under 240 lines.',
  'styles.css': 'Style the actual supplied HTML AND the elements rendered by app.js. Use role tokens, content previews, aligned heading/actions, restrained cards and distinct primary actions. All visible text including buttons, inputs, placeholders and badges must meet the contract typography minimum. Form controls inherit font. Respect [hidden] with display:none !important and do not override it. Keep desktop columns and mobile stacking, no horizontal overflow. Add visible keyboard focus and global reduced-motion rules. Keep CSS under 180 lines.'
};

export function generationPhases(profile = 'resume') {
  if (profile === 'resume') return phases;
  if (profile !== 'service') throw new Error(`Unknown generation profile: ${profile}`);
  return {
    'index.html': 'Create the complete semantic HTML shell for this service contract. Link styles.css and deferred app.js. Use the exact requested visible labels, stable IDs, real content, navigation and forms. Keep dialogs hidden initially. Do not add controls outside the specified scope. Keep this file concise.',
    'app.js': 'Implement every interaction in the service contract using the supplied HTML IDs. Persist mutations in localStorage, distinguish absent storage from an empty saved state, validate forms with visible messages, preserve user input on failure, and render user strings as text. Every visible control must work. Do not use alert/confirm/prompt. Keep functions short and focused.',
    'styles.css': 'Style the supplied HTML and JS-generated markup according to this service reference, not a generic card template. Use role tokens, deliberate density, clear action priority and responsive layout. Visible text is at least 14px. Controls inherit font. Honor [hidden] with display:none !important. Include keyboard focus and reduced-motion support. Do not use external fonts or assets unless explicitly supplied.'
  };
}

export function validateGeneratedFile(path, response) {
  if (response.done_reason !== 'stop') throw new Error(`Truncated generation for ${path}: ${response.done_reason}`);
  const result = JSON.parse(response.message.content);
  if (result.path !== path || typeof result.content !== 'string' || !result.content.trim()) throw new Error('Invalid generated file');
  if (path === 'app.js') parse(result.content, { ecmaVersion: 'latest', sourceType: 'module' });
  if (path === 'styles.css') postcss.parse(result.content);
  if (path === 'index.html' && !/<\/html>\s*$/i.test(result.content)) throw new Error('Incomplete HTML document');
  return result.content;
}

export async function generate(target, evidence, options = {}) {
  const selectedPhases = generationPhases(options.profile);
  for (const path of Object.keys(selectedPhases)) {
    if (await access(resolve(target, path)).then(() => true, () => false)) throw new Error('Staged generation requires a fresh target without application files');
  }
  const contract = await readFile(resolve(target, 'DESIGN.md'), 'utf8');
  const skill = await readFile(resolve(root, 'skills/qwen-samkill-ui/SKILL.md'), 'utf8');
  const reference = await readFile(resolve(target, 'REFERENCE.md'), 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; });
  const files = {};
  for (const [path, instruction] of Object.entries(selectedPhases)) {
    let error = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`Generating ${path}, attempt ${attempt}`);
      const response = await inferenceFetch(`${process.env.OLLAMA_URL || 'http://127.0.0.1:11434'}/api/chat`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(inferenceTimeout()),
        body: JSON.stringify({
          model: process.env.QWEN_GENERATE_MODEL, stream: false, think: process.env.QWEN_GENERATE_THINK !== 'false',
          messages: [
            { role: 'system', content: 'You implement one complete source file in a staged local UI build. Return only the structured JSON object. No explanations, markdown fences, code comments or placeholder implementations. The runner saves your file and independently tests the completed application. Never claim checks passed. Follow the design contract and coordinate exactly with supplied files.' },
            { role: 'user', content: `SKILL\n${skill}\n\nDESIGN CONTRACT\n${contract}\n\nREFERENCE OBSERVATIONS\n${reference}\n\nGENERATE ${path}\n${instruction}\n\nPREVIOUS ERROR\n${error || 'None'}\n\nEXISTING SOURCE\n${Object.entries(files).map(([name, content]) => `FILE: ${name}\n${content}\nEND FILE`).join('\n\n')}\n\nREQUIRED HTML INTERFACE (id: element tag; preserve exactly)\n${JSON.stringify(options.interface || {})}` }
          ],
          format: { type: 'object', properties: { path: { const: path }, content: { type: 'string' } }, required: ['path', 'content'], additionalProperties: false },
          options: { num_ctx: 32768, num_predict: options.profile === 'service' ? 6144 : 8192, ...samplingOptions(), ...inferenceOptions() }
        })
      });
      if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
      const result = await response.json();
      await writeFile(resolve(evidence, `generate-${path}-${attempt}.json`), JSON.stringify({ model: result.model, done_reason: result.done_reason, prompt_eval_count: result.prompt_eval_count, prompt_eval_duration: result.prompt_eval_duration, load_duration: result.load_duration, eval_count: result.eval_count, eval_duration: result.eval_duration, total_duration: result.total_duration, content: result.message?.content }, null, 2));
      try {
        const content = validateGeneratedFile(path, result);
        if (path === 'index.html') validateInterface(content, options.interface);
        files[path] = content;
        await writeFile(resolve(evidence, `validated-${path}`), content);
        break;
      }
      catch (failure) { error = failure.message; if (attempt === 2) throw failure; }
    }
  }
  for (const [path, content] of Object.entries(files)) await writeFile(resolve(target, path), content, { flag: 'wx' });
}
