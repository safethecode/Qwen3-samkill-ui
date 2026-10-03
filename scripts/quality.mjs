import { mkdir, readFile, writeFile, open, unlink } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadQualityConfig, reviewViewport, ensureVision, hash } from './vision-review.mjs';
import { runQualityLoop } from './quality-loop.mjs';
import { viewports } from './quality-policy.mjs';
import { run } from './process.mjs';
import { readEvaluation } from './run-state.mjs';
import { repair } from './repair.mjs';
import { removeComments } from './comments.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(process.argv[2] || 'runs/resume');
const rounds = Number(process.argv[3] ?? 4);
const functionalRounds = Number(process.env.QWEN_FUNCTIONAL_ROUNDS || 3);
const configPath = resolve(process.argv[4] || resolve(target, 'QUALITY.json'));
const model = process.env.QWEN_REVIEW_MODEL || 'qwen3.5:9b';
const endpoint = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const names = ['index.html', 'styles.css', 'app.js'];
process.env.QWEN_DESIGN_CHECKS = '1';
process.env.QWEN_GENERATE_MODEL ||= 'qwen3-coder:30b';
process.env.QWEN_GENERATE_THINK ??= 'false';
process.env.QWEN_REPAIR_MODEL ||= 'qwen3.5:9b';
process.env.QWEN_REPAIR_THINK ??= 'false';
await mkdir(target, { recursive: true });
const lockPath = resolve(target, '.quality-lock');
let lock;
try { lock = await open(lockPath, 'wx'); }
catch { throw new Error('Another quality run owns this target, or its lock needs inspection'); }
const evidence = resolve(target, `quality-${Date.now()}`);
const startedAt = new Date().toISOString();
const snapshot = async () => Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(resolve(target, name), 'utf8')])));
const restore = async source => { for (const name of names) await writeFile(resolve(target, name), source[name]); };
const save = async (path, value) => writeFile(path, JSON.stringify(value, null, 2));
const publish = async result => {
  const summary = { ...result, startedAt, updatedAt: new Date().toISOString(), reviewer: model, evidence: relative(target, evidence), completionScope: 'Local model quality judgment for the declared resume fixture; not guaranteed reference equivalence.' };
  await save(resolve(target, 'QUALITY-RESULT.json'), summary);
  await save(resolve(evidence, 'summary.json'), summary);
  await writeFile(resolve(target, 'UI-STATUS.md'), `# UI quality status\n\n${summary.status}\n\n${summary.reason || 'Functional checks and two independent visual passes succeeded.'}\n\nEvidence: ${summary.evidence}/summary.json\n\nThis is automated local-model judgment, not human design approval.\n`);
};
let step = 0;
const events = [];
try {
  await mkdir(evidence);
  await publish({ status: 'RUNNING', reason: 'Quality gates have not completed.' });
  if (!Number.isInteger(rounds) || rounds < 0 || rounds > 10 || !Number.isInteger(functionalRounds) || functionalRounds < 1 || functionalRounds > 10) throw new Error('Invalid functional/visual round budget');
  const config = await loadQualityConfig(configPath);
  const contract = await readFile(resolve(target, 'DESIGN.md'), 'utf8');
  await ensureVision(model, endpoint);
  const bindings = async () => {
    const currentConfig = await loadQualityConfig(configPath);
    if (currentConfig.configHash !== config.configHash || JSON.stringify(currentConfig.referenceHashes) !== JSON.stringify(config.referenceHashes)) throw new Error('Reference configuration changed during quality run');
    const currentContract = await readFile(resolve(target, 'DESIGN.md'), 'utf8');
    if (currentContract !== contract) throw new Error('Design contract changed during quality run');
    return hash(JSON.stringify({ source: await snapshot(), config: config.configHash, references: config.referenceHashes, contract }));
  };
  const stale = () => Object.assign(new Error('Source changed during quality inspection; completion refused'), { code: 'STALE_SOURCE' });
  const code = await run(process.execPath, [resolve(repo, 'scripts/iterate.mjs'), target, String(functionalRounds)], resolve(evidence, 'functional.log'), target);
  if (code !== 0) throw new Error(`Functional runner failed (${code}); visual completion refused`);
  const inspect = async (audit, previous) => {
    const directory = audit ? resolve(target, previous.evidence) : resolve(evidence, `inspection-${++step}`);
    if (!audit) await mkdir(directory);
    const binding = await bindings();
    if (audit && previous.binding !== binding) throw stale();
    let functional = previous?.functional;
    if (!audit) {
      const exit = await run(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, directory], resolve(directory, 'evaluation.log'), target);
      functional = await readEvaluation(directory, exit);
    }
    const visual = {};
    if (functional.passed === functional.total) {
      for (const viewport of viewports) {
        visual[viewport] = await reviewViewport({ model, endpoint, reference: config.references[viewport], current: resolve(directory, `${viewport}.png`), viewport, contract, observations: config.observations, audit, evidence: directory });
        if (visual[viewport].referenceHash !== config.referenceHashes[viewport]) throw new Error('Reference image changed');
        if (audit && visual[viewport].currentHash !== previous.visual[viewport].currentHash) throw new Error('Screenshot changed before final audit');
      }
    }
    if (await bindings() !== binding) throw stale();
    const result = { binding, functional, visual, evidence: relative(target, directory) };
    await save(resolve(directory, audit ? 'audit.json' : 'inspection.json'), result);
    console.log(`${audit ? 'Audit' : 'Inspection'} ${step}: functional ${functional.passed}/${functional.total}`);
    return result;
  };
  let lastRepairKey = '';
  let unitAttempt = 0;
  const result = await runQualityLoop({ rounds, inspect, snapshot, restore,
    repair: async (failure, mode, attempt) => {
      const directory = resolve(evidence, `repair-${attempt}`);
      await mkdir(directory);
      await save(resolve(directory, 'request.json'), { failure, mode });
      console.log(`Visual repair ${attempt}: ${mode}, ${failure.detail}`);
      const repairKey = JSON.stringify(failure);
      if (repairKey !== lastRepairKey) { lastRepairKey = repairKey; unitAttempt = 0; }
      const before = await bindings();
      try { await repair(target, directory, failure, '', { bounded: true, unitAttempt: unitAttempt++ }); }
      catch (error) {
        if (await bindings() !== before) throw stale();
        throw error;
      }
      const source = await snapshot();
      const cleaned = removeComments(source['index.html'], source['styles.css'], source['app.js']);
      await restore(Object.fromEntries(names.map((name, index) => [name, cleaned[['html', 'css', 'js'][index]]])));
    },
    record: async event => {
      events.push(event);
      await save(resolve(evidence, 'events.json'), events);
      console.log(`Quality gate: ${event.type}`);
    }
  });
  if (result.status === 'COMPLETE' && await bindings() !== result.confirmation.binding) throw stale();
  await publish({ ...result, referenceHashes: config.referenceHashes, configHash: config.configHash, events: events.map(({ source, ...event }) => event) });
  process.exitCode = result.status === 'COMPLETE' ? 0 : 1;
  console.log(`${result.status}: ${result.reason || 'All required gates passed'}`);
} catch (error) {
  await publish({ status: 'INCOMPLETE', reason: error.message }).catch(publicationError => console.error(`Cannot persist quality status: ${publicationError.message}`));
  console.error(`INCOMPLETE: ${error.message}`);
  process.exitCode = 1;
} finally { await lock.close(); await unlink(lockPath); }
