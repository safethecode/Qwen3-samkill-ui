import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { serviceCases } from '../evals/service-cases.mjs';
import { evaluateService } from './service-evaluate.mjs';
import { evaluateBoundSource } from './service-resume.mjs';
import { harnessBinding } from './harness-binding.mjs';

const root = resolve(process.argv[2] || 'runs/service-study');
const study = JSON.parse(await readFile(resolve(root, 'study.json'), 'utf8'));
const digest = data => createHash('sha256').update(data).digest('hex');
const results = [];
const revalidationHarnessHashes = await harnessBinding();
for (const result of study.results) {
  if (!result.sourceHashes) { results.push(result); continue; }
  const fixture = serviceCases.find(c => c.id === result.case);
  const target = resolve(root, fixture.id, 'source');
  for (const [name, expected] of Object.entries(result.sourceHashes)) {
    if (digest(await readFile(resolve(target, name))) !== expected) throw new Error(`Source changed since generation: ${fixture.id}/${name}; record repairs separately`);
  }
  const current = await evaluateBoundSource(result.sourceHashes, async () => Object.fromEntries(await Promise.all(Object.keys(result.sourceHashes).map(async name => [name, digest(await readFile(resolve(target, name)))]))), () => evaluateService(target, resolve(root, fixture.id, 'reevaluated'), fixture, { textStress: true }));
  results.push({ ...result, ...current });
}
if (JSON.stringify(await harnessBinding()) !== JSON.stringify(revalidationHarnessHashes)) throw new Error('Evaluation harness changed during the study; do not publish mixed-version results');
await writeFile(resolve(root, 'revalidation.json'), JSON.stringify({ ...study, revalidated: new Date().toISOString(), evaluatorHash: digest(await readFile(new URL('./service-evaluate.mjs', import.meta.url))), revalidationHarnessHashes, results }, null, 2));
