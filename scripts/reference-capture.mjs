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
    await evaluateService(upstream, resolve(output, fixture.id), fixture, { reference: true, entry: fixture.entry });
    results.push({ case: fixture.id, entry: fixture.entry, scope: fixture.scope, capture: 'OK', viewports: [1440, 390, 320], note: 'Reference screenshots only; no functional certification of upstream code.' });
  } catch (error) { results.push({ case: fixture.id, capture: 'FAIL', error: error.message.replaceAll(upstream, '<upstream>') }); }
}
await writeFile(resolve(output, 'inventory.json'), JSON.stringify({ missing: [5, 6, 7], results }, null, 2));
