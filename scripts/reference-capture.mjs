import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serviceCases } from '../evals/service-cases.mjs';
import { evaluateService } from './service-evaluate.mjs';

if (!process.argv[2] || !process.argv[3]) throw new Error('Usage: node scripts/reference-capture.mjs UPSTREAM_ROOT OUTPUT');
const upstream = resolve(process.argv[2], 'design/reference-language');
const output = resolve(process.argv[3]);
await mkdir(output, { recursive: true });
const results = [];
for (const fixture of serviceCases.filter(c => c.entry)) {
  try {
    const states = [];
    const captureStates = async (page, width, evidence, url) => {
      const actions = ({
        'round-04': [['detail', () => page.getByRole('link', { name: '온실 커피 상세 보기', exact: true }).click()], ['booking', () => page.getByRole('button', { name: /온실 커피.*예약 선택/ }).first().click()]],
        'round-08': [['ingredients', () => page.getByRole('button', { name: '바꾸기', exact: true }).click()]],
        'round-09': [['editor', () => page.getByRole('button', { name: '편집', exact: true }).first().click()]],
        'round-10': [['response', () => page.locator('#respond-button').click()]]
      })[fixture.id] || [];
      for (const [name, act] of actions) {
        await page.goto(url);
        try {
          await act();
          await page.screenshot({ path: resolve(evidence, `${name}-${width}.png`) });
          states.push({ name, width, status: 'CAPTURED' });
        } catch (error) { states.push({ name, width, status: 'FAIL', error: error.message.slice(0, 500) }); }
      }
    };
    await evaluateService(upstream, resolve(output, fixture.id), fixture, { reference: true, entry: fixture.entry, captureStates });
    results.push({ case: fixture.id, entry: fixture.entry, scope: fixture.scope, capture: 'OK', viewports: [1440, 390, 320], states, note: 'Reference screenshots only; no functional certification of upstream code.' });
  } catch (error) { results.push({ case: fixture.id, capture: 'FAIL', error: error.message.replaceAll(upstream, '<upstream>') }); }
}
await writeFile(resolve(output, 'inventory.json'), JSON.stringify({ missing: [5, 6, 7], results }, null, 2));
