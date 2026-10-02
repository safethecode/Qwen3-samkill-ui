import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRunDirectory, readEvaluation } from './run-state.mjs';
import { run as runProcess } from './process.mjs';
import { repair } from './repair.mjs';
import { PatchError } from './patches.mjs';
import { removeComments } from './comments.mjs';
import { generate } from './generate.mjs';
import { assessProgress } from './progress.mjs';
import { selectFailure, selectRepair } from './feedback.mjs';
import { withRollback } from './transaction.mjs';
import { normalizeTypography } from './typography.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(process.argv[2] || 'runs/resume');
const rounds = Number(process.argv[3] || 3);
if (!Number.isInteger(rounds) || rounds < 1 || rounds > 10) throw new Error('Rounds must be between 1 and 10.');
await mkdir(target, { recursive: true });
await readFile(resolve(target, 'DESIGN.md'));
const runDirectory = await createRunDirectory(target);
const run = (exe, args, log) => runProcess(exe, args, log, target);
let prompt = 'Read qwen-samkill-ui and DESIGN.md. Implement the requested resume UI completely in index.html, styles.css and app.js. Use real tools, save files, test them. Do not search external references or analytics. Do not add code comments. Never claim unexecuted checks passed.';
let failure;
let previousError = '';
let acceptedReport;
const attempts = {};
const names = ['index.html', 'styles.css', 'app.js'];
const snapshot = async () => Object.fromEntries(await Promise.all(names.map(async name => [name, await readFile(resolve(target, name), 'utf8')])));
const restore = async files => { for (const [name, content] of Object.entries(files)) await writeFile(resolve(target, name), content); };
const feedback = (report, selected = selectFailure(report, attempts)) => `Read DESIGN.md and the affected source files. Fix this one failing browser check using small targeted edits, not whole-file replacements: ${JSON.stringify(selected)}. Preserve all other existing features and exact control labels (편집, 복제, 보관, 전체, 보관함, 새 이력서, 저장, 취소). Do not add unrelated features or delete functionality. Save the actual changes and run syntax checks. No code comments. Do not claim full completion; the external evaluator will run next.`;
const existing = await Promise.all(['index.html', 'styles.css', 'app.js'].map(file => access(resolve(target, file)).then(() => true, () => false)));
if (existing.every(Boolean)) {
  const evidence = resolve(runDirectory, 'preflight');
  await mkdir(evidence, { recursive: true });
  const code = await run(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, evidence], resolve(evidence, 'evaluation.log'));
  const report = await readEvaluation(evidence, code);
  acceptedReport = report;
  if (report.passed === report.total) { console.log('Fixture checks already pass. Visual review remains required.'); process.exit(0); }
  failure = selectFailure(report, attempts);
  prompt = feedback(report);
}
for (let round = 1; round <= rounds; round++) {
  const evidence = resolve(runDirectory, `evidence-${round}`);
  await mkdir(evidence, { recursive: true });
  const before = acceptedReport ? await snapshot() : null;
  if (acceptedReport) {
    ({ failure, previousError } = selectRepair(acceptedReport, attempts, failure, previousError));
    attempts[failure.name] = (attempts[failure.name] || 0) + 1;
    prompt = `Fix this failing check: ${JSON.stringify(failure)}. ${feedback(acceptedReport, failure)}\n${previousError}`;
  }
  if (!acceptedReport && process.env.QWEN_GENERATE_MODEL) {
    await generate(target, evidence);
  } else if (failure?.name.startsWith('typography') && attempts[failure.name] === 1) {
    await writeFile(resolve(evidence, 'before.json'), JSON.stringify(before));
    await writeFile(resolve(target, 'styles.css'), normalizeTypography(before['styles.css']));
    console.log('Applied contract typography normalization.');
  } else if (failure?.name === 'no-code-comments') {
    const names = ['index.html', 'styles.css', 'app.js'];
    const sources = await Promise.all(names.map(name => readFile(resolve(target, name), 'utf8')));
    const cleaned = removeComments(...sources);
    await writeFile(resolve(evidence, 'before.json'), JSON.stringify(Object.fromEntries(names.map((name, index) => [name, sources[index]]))));
    for (const [index, kind] of ['html', 'css', 'js'].entries()) await writeFile(resolve(target, names[index]), cleaned[kind]);
    console.log('Removed parsed code comments while preserving strings and JavaScript line breaks.');
  } else if (failure && process.env.QWEN_REPAIR_MODEL) {
    try {
      await repair(target, evidence, failure, previousError);
      previousError = '';
    } catch (error) {
      if (!(error instanceof PatchError || error instanceof SyntaxError)) throw error;
      previousError = `${error.message}. The supplied current source is unchanged. Fix the actual failing behavior, not just a data flag.`;
      await writeFile(resolve(evidence, 'rejected.json'), JSON.stringify({ reason: previousError }));
      console.error(`Rejected model patch: ${previousError}`);
      continue;
    }
  } else {
    const log = resolve(evidence, 'model.jsonl');
    const args = ['run', '--pure', '--agent', 'local-ui', '--format', 'json'];
    if (process.env.QWEN_MODEL) args.push('--model', process.env.QWEN_MODEL);
    args.push(prompt);
    await withRollback(target, before, async () => {
      const code = await run(process.env.OPENCODE_BIN || 'opencode', args, log);
      const events = (await readFile(log, 'utf8')).split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
      if (code !== 0 || events.some(e => e.type === 'error')) throw new Error(`OpenCode failed in round ${round}; inspect ${log}`);
    });
  }
  let report;
  try {
    const source = await snapshot();
    let cleaned;
    try { cleaned = removeComments(source['index.html'], source['styles.css'], source['app.js']); }
    catch (error) { if (!(error instanceof SyntaxError) && error.name !== 'CssSyntaxError') throw error; }
    if (cleaned) {
      const normalized = Object.fromEntries(names.map((name, index) => [name, cleaned[['html', 'css', 'js'][index]]]));
      if (names.some(name => normalized[name] !== source[name])) {
        await writeFile(resolve(evidence, 'before-normalization.json'), JSON.stringify(source));
        await restore(normalized);
      }
    }
    const evaluationCode = await run(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, evidence], resolve(evidence, 'evaluation.log'));
    report = await readEvaluation(evidence, evaluationCode);
  } catch (error) {
    if (before) await restore(before);
    throw error;
  }
  if (acceptedReport) {
    const progress = assessProgress(acceptedReport, report);
    await writeFile(resolve(evidence, 'progress.json'), JSON.stringify(progress, null, 2));
    if (!progress.accept) {
      await writeFile(resolve(evidence, 'rejected-candidate.json'), JSON.stringify(await snapshot()));
      await restore(before);
      previousError = `Previous patch did not fix this check without regressions. Reverted to the supplied source. Candidate failures: ${JSON.stringify(report.results.filter(r => r.status === 'FAIL'))}. Inspect the actual cause.`;
      prompt = feedback(acceptedReport) + '\n' + previousError;
      console.log('Rejected non-improving or regressing candidate; restored previously accepted files.');
      continue;
    }
  }
  acceptedReport = report;
  if (report.passed === report.total) {
    console.log('Fixture checks passed. Visual quality remains UNVERIFIED until screenshots are reviewed.');
    process.exit(0);
  }
  prompt = feedback(report);
  const nextFailure = selectFailure(report, attempts);
  previousError = failure?.name === nextFailure?.name ? 'Previous patch did not fix this check. Reproduce its actual cause and inspect the other source files rather than repeating the same change.' : '';
  failure = nextFailure;
}
console.error('Round limit reached with failing checks. Evidence retained; task is not complete.');
process.exitCode = 1;
