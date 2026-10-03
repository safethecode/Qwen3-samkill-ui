import { mkdir, readFile, writeFile, open, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serviceCases } from '../evals/service-cases.mjs';
import { evaluateService } from './service-evaluate.mjs';
import { repair } from './repair.mjs';
import { removeComments } from './comments.mjs';
import { rollbackOwned } from './owned-rollback.mjs';

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
try {
  await mkdir(evidence, { recursive: true });
  let current = await evaluateService(target, resolve(evidence, 'initial'), fixture);
  const events = [];
  let previousName = '';
  let unitAttempt = 0;
  for (let attempt = 1; attempt <= rounds && current.passed < current.total; attempt++) {
    const failure = current.checks.find(c => c.status === 'FAIL' && !/^(content|overflow|readable|runtime)-/.test(c.name)) || current.checks.find(c => c.status === 'FAIL');
    if (failure.name !== previousName) { previousName = failure.name; unitAttempt = 0; }
    const before = await snapshot();
    const step = resolve(evidence, `attempt-${attempt}`);
    await mkdir(step);
    let owned = null;
    try {
      const files = /^(overflow|readable)-/.test(failure.name) ? ['styles.css'] : ['app.js', 'index.html'];
      await repair(target, step, { name: 'visual-review', files, detail: `${failure.name}: ${failure.detail}` }, '', { bounded: true, unitAttempt: unitAttempt++ });
      const raw = await snapshot();
      const clean = removeComments(...raw);
      await restore([clean.html, clean.css, clean.js]);
      owned = [clean.html, clean.css, clean.js];
      const candidate = await evaluateService(target, resolve(step, 'evaluation'), fixture);
      const regressions = current.checks.filter(c => c.status === 'PASS' && candidate.checks.find(n => n.name === c.name)?.status !== 'PASS').map(c => c.name);
      const accepted = candidate.passed > current.passed && !regressions.length;
      events.push({ attempt, failure: failure.name, accepted, passed: candidate.passed, total: candidate.total, regressions });
      if (accepted) current = candidate;
      else { await writeFile(resolve(step, 'rejected-source.json'), JSON.stringify(await snapshot())); await rollbackOwned(snapshot, restore, owned, before); owned = null; }
    } catch (error) {
      if (error.code === 'STALE_SOURCE' || /Source changed during generation/.test(error.message)) throw error;
      await rollbackOwned(snapshot, restore, owned, before);
      events.push({ attempt, failure: failure.name, accepted: false, error: error.message.replaceAll(target, '<target>') });
    }
    await writeFile(resolve(evidence, 'events.json'), JSON.stringify(events, null, 2));
    console.log(`${caseId} attempt ${attempt}: ${current.passed}/${current.total}`);
  }
  const result = { status: current.passed === current.total ? 'FUNCTIONAL_PASS' : 'INCOMPLETE', visual: 'UNVERIFIED', report: current, events };
  await writeFile(resolve(evidence, 'result.json'), JSON.stringify(result, null, 2));
  if (result.status === 'INCOMPLETE') process.exitCode = 1;
} finally { await unlink(lock); }
