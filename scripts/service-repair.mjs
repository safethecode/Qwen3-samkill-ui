import { mkdir, readFile, writeFile, open, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serviceCases } from '../evals/service-cases.mjs';
import { evaluateService } from './service-evaluate.mjs';
import { repair } from './repair.mjs';
import { removeComments } from './comments.mjs';
import { rollbackOwned, assertOwned } from './owned-rollback.mjs';
import { createHash } from 'node:crypto';
import { serviceProgress } from './service-progress.mjs';

const [directory, caseId, budget = '4'] = process.argv.slice(2);
const fixture = serviceCases.find(c => c.id === caseId);
const rounds = Number(budget);
if (!directory || !fixture || !Number.isInteger(rounds) || rounds < 0 || rounds > 10) throw new Error('Usage: node scripts/service-repair.mjs TARGET CASE_ID ROUNDS(0–10)');
const target = resolve(directory);
const evidence = resolve(target, '..', `repair-${Date.now()}`);
const names = ['index.html', 'styles.css', 'app.js'];
const snapshot = async () => Promise.all(names.map(name => readFile(resolve(target, name), 'utf8')));
const restore = async contents => { for (let i = 0; i < names.length; i++) await writeFile(resolve(target, names[i]), contents[i]); };
const lock = resolve(target, '.service-repair-lock');
const handle = await open(lock, 'wx');
await handle.close();
let acceptedSource = null;
let workingSource = null;
try {
  await mkdir(evidence, { recursive: true });
  acceptedSource = await snapshot();
  let current = await evaluateService(target, resolve(evidence, 'initial'), fixture);
  await assertOwned(snapshot, acceptedSource);
  workingSource = acceptedSource;
  let workingReport = current;
  const events = [];
  let previousName = '';
  let unitAttempt = 0;
  for (let attempt = 1; attempt <= rounds && current.passed < current.total; attempt++) {
    await assertOwned(snapshot, workingSource);
    const failure = workingReport.checks.find(c => c.status === 'FAIL');
    if (failure.name !== previousName) { previousName = failure.name; unitAttempt = 0; }
    const before = await snapshot();
    const step = resolve(evidence, `attempt-${attempt}`);
    await mkdir(step);
    let owned = null;
    try {
      const files = /^(overflow|readable|font-rendering)-/.test(failure.name) ? ['styles.css'] : /^labels-/.test(failure.name) ? ['index.html', 'app.js'] : ['app.js', 'index.html', 'styles.css'];
      const applied = await repair(target, step, { name: 'visual-review', files, detail: `${failure.name}: ${failure.detail}` }, '', { bounded: true, unitAttempt: unitAttempt++ });
      owned = names.map(name => applied.files[name]);
      const raw = await snapshot();
      if (raw.some((source, index) => source !== owned[index])) { const error = new Error('Source changed before normalization'); error.code = 'STALE_SOURCE'; throw error; }
      const clean = removeComments(...raw);
      await restore([clean.html, clean.css, clean.js]);
      owned = [clean.html, clean.css, clean.js];
      const candidate = await evaluateService(target, resolve(step, 'evaluation'), fixture);
      await assertOwned(snapshot, owned);
      const { decision, regressions } = serviceProgress(current, candidate);
      events.push({ attempt, failure: failure.name, accepted: decision === 'accept', pending: decision === 'stage', passed: candidate.passed, total: candidate.total, regressions });
      if (decision === 'accept') { current = candidate; workingReport = candidate; acceptedSource = owned; workingSource = owned; unitAttempt = 0; }
      else if (decision === 'stage') { workingReport = candidate; workingSource = owned; await writeFile(resolve(step, 'pending-source.json'), JSON.stringify(owned)); }
      else { await writeFile(resolve(step, 'rejected-source.json'), JSON.stringify(await snapshot())); await rollbackOwned(snapshot, restore, owned, before); owned = null; }
    } catch (error) {
      if (error.code === 'STALE_SOURCE' || /Source changed during generation/.test(error.message)) throw error;
      await rollbackOwned(snapshot, restore, owned, before);
      events.push({ attempt, failure: failure.name, accepted: false, error: error.message.replaceAll(target, '<target>') });
    }
    await writeFile(resolve(evidence, 'events.json'), JSON.stringify(events, null, 2));
    console.log(`${caseId} attempt ${attempt}: ${current.passed}/${current.total}`);
  }
  const rolledBackPending = workingSource.some((source, index) => source !== acceptedSource[index]);
  if (rolledBackPending) await rollbackOwned(snapshot, restore, workingSource, acceptedSource);
  await assertOwned(snapshot, acceptedSource);
  const sourceHashes = Object.fromEntries(names.map((name, index) => [name, createHash('sha256').update(acceptedSource[index]).digest('hex')]));
  const result = { status: current.passed === current.total ? 'FUNCTIONAL_PASS' : 'INCOMPLETE', visual: 'UNVERIFIED', sourceHashes, report: current, events, rolledBackPending };
  await writeFile(resolve(evidence, 'result.json'), JSON.stringify(result, null, 2));
  if (result.status === 'INCOMPLETE') process.exitCode = 1;
} catch (error) {
  if (error.code !== 'STALE_SOURCE' && workingSource && acceptedSource) await rollbackOwned(snapshot, restore, workingSource, acceptedSource);
  throw error;
} finally { await unlink(lock); }
