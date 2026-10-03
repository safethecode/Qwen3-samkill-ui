import { parse } from 'acorn';
import postcss from 'postcss';

export const serviceStages = [
  { id: 'shell', file: 'index.html', tokens: 2048, instruction: 'Write the complete semantic HTML shell. Include all contract IDs with exact element types, visible labels, forms and initial hidden panels. Link styles.css and deferred app.js. Use concise markup without comments. Do not inline scripts or styles. Render repeated content in JavaScript. Aim for under 80 lines.' },
  { id: 'state', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the first part of app.js: example data, state, safe localStorage loading/saving, and render functions. Do not wire event listeners or initialize the app yet: that is the next request. Define named functions that the next part can call. Use the HTML IDs exactly. Use textContent or escape every user string. Keep this part compact, aiming for under 90 lines.' },
  { id: 'behavior', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the navigation/search part of app.js: wire search, filters, opening detail panels and navigation actions. Reuse the previous state and render functions without redeclaring them. Do not implement form submit, saving, cancellation, or startup yet; those belong to the next unit. Only implement controls required by this product. Under 50 compact lines.' },
  { id: 'forms', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the final app.js unit: form validation, submitting/saving, cancelling/removing and persistent reload restoration required by this contract. Reuse every existing state variable and function; do not repeat navigation/search handlers. Initialize the application after all handlers and functions exist. For a static screen, keep disabled controls and initialize only its actual rendering. Under 60 compact lines.' },
  { id: 'layout', file: 'styles.css', tokens: 2048, instruction: 'Write ONLY the first part of styles.css: root role tokens, body/type defaults, main layout, dominant content component and desktop structure. Inspect classes actually present in HTML and rendered JavaScript. Forms, controls, hidden states, focus and responsive rules follow in the next request. Compact CSS, at most 60 short rules; do not restate existing source.' },
  { id: 'responsive', file: 'styles.css', tokens: 1536, instruction: 'Write ONLY the final part of styles.css: form and button styling, hidden states, status/selected states, keyboard focus, reduced motion, and mobile 390/320 adaptations. Previous CSS will be prepended. Reuse its tokens and override only where necessary. Preserve 14px minimum visible type, inherited form fonts and [hidden]{display:none!important}. No page horizontal overflow. Keep at most 45 short rules.' }
];

export function stagesForFlow(flow) {
  if (flow !== 'static') return serviceStages;
  const instructions = {
    shell: `${serviceStages[0].instruction} STATIC TRANSLATION: show example controls disabled with a visible example disclosure. Preserve native text entry only where the contract requests it. Do not create forms, booking panels or product workflows absent from the contract.`,
    state: 'STATIC TRANSLATION: write ONLY static example data and function renderStaticView() which renders all required content into the existing HTML. Define this exact synchronous zero-argument function at top level. The runner calls it once after loading; do not call it yourself. Preserve reference assets and full content. Use textContent or escape strings. Do not add storage, user accounts, editable data, forms or product state. Under 90 compact lines.',
    behavior: 'STATIC TRANSLATION: write ONLY JavaScript needed to keep example controls explicitly disabled. Native text entry may remain when required, but do not wire filtering, navigation, favorite toggles, alerts, submission or persistence. Do not initialize or repeat render functions. Return void 0; when no JavaScript is needed.',
    forms: 'STATIC TRANSLATION: write ONLY startup calling the existing render functions once. There are no form workflows to implement. Keep example actions disabled after rendering. Do not invent form elements, validation, saving, cancellation, storage, alerts or listeners for nonexistent elements. Reuse the exact functions already defined. Return void 0; if no startup is needed.'
  };
  return serviceStages.map(stage => ({ ...stage, instruction: instructions[stage.id] || stage.instruction,
    ...(stage.id === 'state' ? { requiredFunction: 'renderStaticView' } : {}),
    ...(stage.id === 'behavior' ? { hostCode: 'void 0;' } : {}),
    ...(stage.id === 'forms' ? { hostCode: "renderStaticView();\ndocument.querySelectorAll('button').forEach(button => { button.disabled = true; });" } : {})
  }));
}

export const stageSource = (stage, code, completed) => [...serviceStages.slice(0, serviceStages.findIndex(item => item.id === stage.id)).filter(item => item.file === stage.file).map(item => completed[item.id]), code].join('\n');

export function validateStage(stage, code, completed) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Empty stage output');
  if (stage.file !== 'index.html' && /^\s*<(?:!doctype\b|[a-z][\w-]*(?:\s|>))/i.test(code)) throw new Error(`${stage.id} requires ${stage.file === 'app.js' ? 'JavaScript' : 'CSS'} for ${stage.file}; received HTML. The completed HTML shell is read-only. Return only this unit in the required language.`);
  if (stage.hostCode !== undefined && code !== stage.hostCode) throw new Error('Static lifecycle checkpoint does not match the runner bootstrap');
  if (stage.requiredFunction) {
    const tree = parse(code, { ecmaVersion: 'latest', sourceType: 'script' });
    if (!tree.body.some(node => node.type === 'FunctionDeclaration' && node.id?.name === stage.requiredFunction && !node.async && !node.generator && node.params.length === 0)) throw new Error(`Define synchronous top-level function ${stage.requiredFunction}() so the runner can initialize the static view`);
  }
  if (stage.file === 'app.js') parse(stageSource(stage, code, completed), { ecmaVersion: 'latest', sourceType: 'script' });
  if (stage.file === 'styles.css') postcss.parse(code);
  if (stage.file === 'index.html' && !/<\/html>\s*$/i.test(code)) throw new Error('Incomplete HTML document');
}

export function assembleStages(completed) {
  for (const stage of serviceStages) {
    if (typeof completed[stage.id] !== 'string') throw new Error(`Missing completed stage: ${stage.id}`);
    if (stage.file === 'styles.css' && !completed[stage.id]) continue;
    validateStage(stage, completed[stage.id], completed);
  }
  return { 'index.html': completed.shell, 'app.js': `${completed.state}\n${completed.behavior}\n${completed.forms}`, 'styles.css': `${completed.layout}\n${completed.responsive}` };
}
