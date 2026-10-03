import { parse } from 'acorn';
import postcss from 'postcss';

export const serviceStages = [
  { id: 'shell', file: 'index.html', tokens: 2048, instruction: 'Write the complete semantic HTML shell. Include all contract IDs with exact element types, visible labels, forms and initial hidden panels. Link styles.css and deferred app.js. Use concise markup without comments. Do not inline scripts or styles. Render repeated content in JavaScript. Aim for under 80 lines.' },
  { id: 'state', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the first part of app.js: example data, state, safe localStorage loading/saving, and render functions. Do not wire event listeners or initialize the app yet: that is the next request. Define named functions that the next part can call. Use the HTML IDs exactly. Use textContent or escape every user string. Keep this part compact, aiming for under 90 lines.' },
  { id: 'behavior', file: 'app.js', tokens: 2048, instruction: 'Write ONLY the second part of app.js: wire every visible control, implement validation and state transitions, and initialize the application. The previous state/render code will appear immediately before this code in the same classic script. Reuse its functions and variables; do not redeclare or repeat them. Handle all required contract flows. Keep this part compact, aiming for under 90 lines.' },
  { id: 'layout', file: 'styles.css', tokens: 1536, instruction: 'Write ONLY the first part of styles.css: root role tokens, body/type defaults, main layout, dominant content component and desktop structure. Inspect classes actually present in HTML and rendered JavaScript. Forms, controls, hidden states, focus and responsive rules follow in the next request. Compact CSS, at most 60 short rules; do not restate existing source.' },
  { id: 'responsive', file: 'styles.css', tokens: 1536, instruction: 'Write ONLY the final part of styles.css: form and button styling, hidden states, status/selected states, keyboard focus, reduced motion, and mobile 390/320 adaptations. Previous CSS will be prepended. Reuse its tokens and override only where necessary. Preserve 14px minimum visible type, inherited form fonts and [hidden]{display:none!important}. No page horizontal overflow. Keep at most 45 short rules.' }
];

export function validateStage(stage, code, completed) {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Empty stage output');
  if (stage.file === 'app.js') parse(stage.id === 'behavior' ? `${completed.state}\n${code}` : code, { ecmaVersion: 'latest', sourceType: 'script' });
  if (stage.file === 'styles.css') postcss.parse(code);
  if (stage.file === 'index.html' && !/<\/html>\s*$/i.test(code)) throw new Error('Incomplete HTML document');
}

export function assembleStages(completed) {
  for (const stage of serviceStages) {
    if (typeof completed[stage.id] !== 'string') throw new Error(`Missing completed stage: ${stage.id}`);
    if (stage.file === 'styles.css' && !completed[stage.id]) continue;
    validateStage(stage, completed[stage.id], completed);
  }
  return { 'index.html': completed.shell, 'app.js': `${completed.state}\n${completed.behavior}`, 'styles.css': `${completed.layout}\n${completed.responsive}` };
}
