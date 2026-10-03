import { readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { prepareCatalogPlan } from './catalog-plan.mjs';
import { checkCatalogGate } from './catalog-gate.mjs';
import { sourceBinding } from './source-binding.mjs';

const [directory, command = 'check'] = process.argv.slice(2);
if (!directory || !['init', 'fingerprint', 'check'].includes(command)) throw new Error('Usage: node scripts/catalog.mjs TARGET init|fingerprint|check');
const target = resolve(directory);
const contractPath = resolve(target, 'design/gate-contract.json');
const reportPath = resolve(target, 'design/gate-report.json');
if (command === 'init') {
  const plan = await prepareCatalogPlan(target);
  if (await access(contractPath).then(() => true, () => false) || await access(reportPath).then(() => true, () => false)) throw new Error('Existing catalog contract/report must be reviewed without overwriting observations');
  const sources = await sourceBinding(target);
  for (const name of ['index.html', 'app.js', 'styles.css', 'DESIGN.md']) if (!sources[name]) throw new Error(`Missing review source: ${name}`);
  const entries = [...plan.rules, ...plan.guides];
  const contract = { schema_version: 1, catalog_version: plan.catalog_version, targets: Object.keys(sources), rules: entries.map(rule => ({ id: rule.id, applicable: true, scope: 'All requested screens and states; applicability review pending', reason: 'Conservative pending review, not a finding. Determine the actual project scope before approval.', checks: rule.checks, exceptions: [] })) };
  await writeFile(contractPath, JSON.stringify(contract, null, 2), { flag: 'wx' });
  await writeFile(reportPath, JSON.stringify({ schema_version: 1, results: entries.map(rule => ({ id: rule.id, status: 'unknown', reason: 'No scoped inspection has been recorded', evidence: [] })) }, null, 2), { flag: 'wx' });
  console.log('Created 75-rule and eight-guide review drafts. All findings remain unknown; scope and evidence must be reviewed before completion.');
} else if (command === 'fingerprint') {
  const script = fileURLToPath(new URL('../skills/qwen-samkill-ui/references/upstream/reference-review/scripts/design_gate.py', import.meta.url));
  const result = await promisify(execFile)(process.env.QWEN_PYTHON || 'python', [script, 'fingerprint', '--root', target, '--contract', contractPath], { windowsHide: true, timeout: 30000 });
  console.log(result.stdout);
} else {
  const result = await checkCatalogGate(target);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.status === 'PASS' ? 0 : result.status === 'FAIL' ? 1 : 2;
}
