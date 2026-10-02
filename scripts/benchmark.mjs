import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { run } from './process.mjs';
import { readEvaluation } from './run-state.mjs';
import { samplingOptions } from './sampling.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] || 'runs/autonomous-benchmark');
if (!process.env.QWEN_GENERATE_MODEL || !process.env.QWEN_REPAIR_MODEL) throw new Error('Set QWEN_GENERATE_MODEL and QWEN_REPAIR_MODEL to local Ollama models first');
await mkdir(dirname(destination), { recursive: true });
await mkdir(destination);
const contract = await readFile(resolve(repo, 'evals/resume-contract.md'), 'utf8');
const reference = (await readFile(resolve(repo, 'evals/reference-observations.md'), 'utf8')) + '\n' + (await readFile(resolve(repo, 'skills/qwen-samkill-ui/references/document-collections.md'), 'utf8'));
process.env.QWEN_DESIGN_CHECKS = '1';
const sources = [...(await readdir(resolve(repo, 'scripts'))).filter(name => name.endsWith('.mjs')).map(name => `scripts/${name}`), 'skills/qwen-samkill-ui/SKILL.md', 'skills/qwen-samkill-ui/references/document-collections.md', 'evals/resume-contract.md', 'evals/reference-observations.md'];
const hashes = Object.fromEntries(await Promise.all(sources.map(async path => [path, createHash('sha256').update(await readFile(resolve(repo, path))).digest('hex')])));
const summary = { startedAt: new Date().toISOString(), operatorIntervention: false, checksVersion: 6, generationModel: process.env.QWEN_GENERATE_MODEL, generationThinking: process.env.QWEN_GENERATE_THINK !== 'false', repairModel: process.env.QWEN_REPAIR_MODEL, repairThinking: process.env.QWEN_REPAIR_THINK !== 'false', rounds: 10, sourceHashes: hashes, trials: [] };
summary.sampling = samplingOptions();
await writeFile(resolve(destination, 'summary.json'), JSON.stringify(summary, null, 2));
for (const name of ['repeat-1', 'repeat-2', 'variant']) {
  const target = resolve(destination, name);
  process.env.QWEN_EVAL_VARIANT = name === 'variant' ? '1' : '0';
  await mkdir(target);
  const variant = name === 'variant' ? '\n변형 요구사항: 주요 행동색을 #6d28d9로 바꾸고 최대 너비는 1040px로 한다. 예시 문서 세 개는 각각 데이터 분석가, 플랫폼 개발자, 제품 디자이너 직무이며 소개를 서로 다르게 작성한다. 기존 컨트롤 라벨과 동작은 유지한다.\n' : '';
  await writeFile(resolve(target, 'DESIGN.md'), contract + variant);
  await writeFile(resolve(target, 'REFERENCE.md'), reference);
  const started = Date.now();
  console.log(`Starting unattended trial: ${name}`);
  const exitCode = await run(process.execPath, [resolve(repo, 'scripts/iterate.mjs'), target, '10'], resolve(target, 'runner.log'), target, 45 * 60 * 1000);
  const finalDirectory = resolve(target, 'independent-final');
  await mkdir(finalDirectory);
  const evaluationCode = await run(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, finalDirectory], resolve(target, 'final-evaluation.log'), target);
  let final;
  try { final = await readEvaluation(finalDirectory, evaluationCode); }
  catch (error) { final = { passed: null, total: null, error: error.message }; }
  const runDirectory = (await readdir(target)).find(name => name.startsWith('run-'));
  const initial = runDirectory ? await readFile(resolve(target, runDirectory, 'evidence-1/report.json'), 'utf8').then(JSON.parse).catch(() => null) : null;
  const trial = { name, exitCode, durationSeconds: Math.round((Date.now() - started) / 1000), initialPassed: initial?.passed ?? null, passed: final.passed, total: final.total, complete: exitCode === 0 && final.total > 0 && final.passed === final.total, error: final.error || (exitCode !== 0 ? 'Runner did not complete; inspect runner.log and runner.log.stderr' : null) };
  summary.trials.push(trial);
  summary.completed = summary.trials.filter(trial => trial.complete).length;
  summary.finishedAt = new Date().toISOString();
  await writeFile(resolve(destination, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(trial));
}
process.exitCode = summary.completed === summary.trials.length ? 0 : 1;
