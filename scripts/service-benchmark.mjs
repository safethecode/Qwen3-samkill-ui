import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { serviceCases } from '../evals/service-cases.mjs';
import { generateService } from './generate-service.mjs';
import { evaluateService } from './service-evaluate.mjs';
import { inferenceOptions } from './inference-options.mjs';
import { removeComments } from './comments.mjs';

const output = resolve(process.argv[2] || 'runs/services');
const selected = process.argv.slice(3);
if (selected.some(id => !serviceCases.some(c => c.id === id))) throw new Error('Unknown service case');
process.env.QWEN_GENERATE_MODEL ||= 'qwen3-coder:30b';
process.env.QWEN_GENERATE_THINK ||= 'false';
await mkdir(output, { recursive: true });
const digest = data => createHash('sha256').update(data).digest('hex');
const harnessHashes = Object.fromEntries(await Promise.all(['scripts/generate-service.mjs', 'scripts/service-stages.mjs', 'scripts/service-evaluate.mjs', 'evals/service-cases.mjs', 'skills/qwen-samkill-ui/SKILL.md'].map(async file => [file, digest(await readFile(file))])));
const study = { model: process.env.QWEN_GENERATE_MODEL, inferenceOptions: inferenceOptions(), harnessHashes, started: new Date().toISOString(), missingUpstreamRounds: [5, 6, 7], results: [] };
const resume = process.env.QWEN_RESUME === '1';
if (await access(resolve(output, 'study.json')).then(() => true, () => false)) {
  if (!resume) throw new Error('Study already exists; choose a fresh output or explicitly resume');
  const previous = JSON.parse(await readFile(resolve(output, 'study.json'), 'utf8'));
  if (previous.model !== study.model || JSON.stringify(previous.inferenceOptions) !== JSON.stringify(study.inferenceOptions)) throw new Error('Resume requires the original model and resource settings');
  study.results = previous.results;
  study.started = previous.started;
}
for (const fixture of selected.length ? selected.map(id => serviceCases.find(c => c.id === id)) : serviceCases) {
  const target = resolve(output, fixture.id, 'source');
  const evidence = resolve(output, fixture.id, 'evidence');
  await mkdir(target, { recursive: true });
  await mkdir(evidence, { recursive: true });
  const started = Date.now();
  const previous = study.results.find(result => result.case === fixture.id);
  if (resume && previous?.sourceHashes) {
    for (const [file, expected] of Object.entries(previous.sourceHashes)) if (digest(await readFile(resolve(target, file))) !== expected) throw new Error(`Cannot resume over modified source: ${fixture.id}/${file}`);
    console.log(`SKIP already generated ${fixture.id}`);
    continue;
  }
  if (previous) study.results = study.results.filter(result => result.case !== fixture.id);
  console.log(`START ${fixture.id}`);
  try {
    if (await access(resolve(target, 'index.html')).then(() => true, () => false)) throw new Error('Existing source: choose a fresh output directory');
    await writeFile(resolve(target, 'DESIGN.md'), fixture.contract);
    await writeFile(resolve(target, 'REFERENCE.md'), fixture.reference);
    await generateService(target, evidence, { interface: fixture.interface, resume });
    const names = ['index.html', 'styles.css', 'app.js'];
    const raw = await Promise.all(names.map(name => readFile(resolve(target, name), 'utf8')));
    const cleaned = removeComments(...raw);
    const normalized = [cleaned.html, cleaned.css, cleaned.js];
    for (let index = 0; index < names.length; index++) await writeFile(resolve(target, names[index]), normalized[index]);
    const sourceHashes = Object.fromEntries(await Promise.all(['index.html', 'app.js', 'styles.css'].map(async name => [name, createHash('sha256').update(await readFile(resolve(target, name))).digest('hex')])));
    const report = await evaluateService(target, evidence, fixture);
    study.results.push({ ...report, contractHash: digest(fixture.contract), sourceHashes, hostNormalization: 'Parser-based comment removal only', elapsedMs: Date.now() - started });
  } catch (error) {
    study.results.push({ case: fixture.id, scope: fixture.scope, status: 'INCOMPLETE', error: error.name === 'TimeoutError' ? 'Local generation timed out' : error.message.replaceAll(target, '<target>').replaceAll(output, '<output>'), elapsedMs: Date.now() - started });
  }
  if (previous) study.results.at(-1).previousAttempts = [...(previous.previousAttempts || []), { ...previous, previousAttempts: undefined }];
  await writeFile(resolve(output, 'study.json'), JSON.stringify(study, null, 2));
  console.log(`END ${fixture.id} ${JSON.stringify(study.results.at(-1))}`);
}
