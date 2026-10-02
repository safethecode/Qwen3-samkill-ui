import { mkdtemp, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const createRunDirectory = target => mkdtemp(resolve(target, 'run-'));

export async function readEvaluation(directory, exitCode) {
  if (exitCode !== 0 && exitCode !== 1) throw new Error(`Evaluator infrastructure failure: ${exitCode}`);
  const report = JSON.parse(await readFile(resolve(directory, 'report.json'), 'utf8'));
  if (!Array.isArray(report.results) || !report.results.length || report.results.some(r => !['PASS', 'FAIL'].includes(r.status))) throw new Error('Invalid evaluation report');
  const passed = report.results.filter(r => r.status === 'PASS').length;
  if (report.total !== report.results.length || report.passed !== passed || (exitCode === 0) !== (passed === report.total)) throw new Error('Evaluation exit status and report disagree');
  return report;
}
