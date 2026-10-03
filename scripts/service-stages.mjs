import { parse } from 'acorn';
import postcss from 'postcss';

export const serviceStages = [
  { id: 'shell', file: 'index.html', tokens: 2048, instruction: 'Write the complete semantic HTML shell. Include all contract IDs with exact element types, visible labels, forms and initial hidden panels. Link styles.css and deferred app.js. Use concise markup without comments. Do not inline scripts or styles. Render repeated content in JavaScript. Aim for under 80 lines.' },
  { id: 'state', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the first part of app.js: example data, state, safe localStorage loading/saving, and render functions. Do not wire event listeners or initialize the app yet: that is the next request. Define named functions that the next part can call. Use the HTML IDs exactly. Use textContent or escape every user string. Keep this part compact, aiming for under 90 lines.' },
  { id: 'behavior', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the navigation/search part of app.js: wire search, filters, opening detail panels and navigation actions. Reuse the previous state and render functions without redeclaring them. Do not implement form submit, saving, cancellation, or startup yet; those belong to the next unit. Only implement controls required by this product. Under 50 compact lines.' },
  { id: 'forms', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the final app.js unit: form validation, submitting/saving, cancelling/removing and persistent reload restoration required by this contract. Reuse every existing state variable and function; do not repeat navigation/search handlers. Initialize the application after all handlers and functions exist. For a static screen, keep disabled controls and initialize only its actual rendering. Under 60 compact lines.' },
  { id: 'layout', file: 'styles.css', tokens: 1536, instruction: 'Write ONLY the first part of styles.css: root role tokens, body/type defaults, main layout, dominant content component and desktop structure. Inspect classes actually present in HTML and rendered JavaScript. Forms, controls, hidden states, focus and responsive rules follow in the next request. Compact CSS, at most 60 short rules; do not restate existing source.' },
  { id: 'responsive', file: 'styles.css', tokens: 1536, instruction: 'Write ONLY the final part of styles.css: form and button styling, hidden states, status/selected states, keyboard focus, reduced motion, and mobile 390/320 adaptations. Previous CSS will be prepended. Reuse its tokens and override only where necessary. Preserve 14px minimum visible type, inherited form fonts and [hidden]{display:none!important}. No page horizontal overflow. Keep at most 45 short rules.' }
];

export const stageSource = (stage, code, completed) => [...serviceStages.slice(0, serviceStages.findIndex(item => item.id === stage.id)).filter(item => item.file === stage.file).map(item => completed[item.id]), code].join('\n');

export function validateStage(stage, code, completed) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Empty stage output');
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
