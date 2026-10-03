import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { sourceBinding } from './source-binding.mjs';
import { guideChecks } from './catalog-plan.mjs';
import { unresolvedFindings } from './review-findings.mjs';

export async function checkCatalogGate(target, options = {}) {
  try {
    const contract = JSON.parse(await readFile(resolve(target, 'design/gate-contract.json'), 'utf8'));
    const files = Object.keys(await sourceBinding(target));
    if (!files.includes('design/typography.json')) throw new Error('Missing role-specific typography contract: design/typography.json');
    const typography = JSON.parse(await readFile(resolve(target, 'design/typography.json'), 'utf8'));
    if (!Array.isArray(typography.roles) || !typography.roles.length || typography.roles.some(role => typeof role.selector !== 'string' || !role.selector.trim() || !Array.isArray(role.families) || !role.families.length || role.families.some(family => typeof family !== 'string' || !family.trim()))) throw new Error('Typography roles must declare intended rendered families and selectors');
    for (const file of files) if (!contract.targets?.some(target => file === target.replaceAll('\\', '/') || file.startsWith(target.replaceAll('\\', '/') + '/'))) throw new Error(`Catalog source scope omits ${file}`);
    for (const [guide, checks] of Object.entries(guideChecks)) {
      const rule = contract.rules?.find(rule => rule.id === `PROJECT-GUIDE-${guide}`);
      if (!rule || !checks.every(check => rule.checks?.includes(check))) throw new Error(`Missing guide coverage or original check kinds: ${guide}`);
      if (['samkill-ui', 'reference-to-ui', 'reference-review'].includes(guide) && rule.applicable !== true) throw new Error(`UI implementation completion cannot exclude its core guide: ${guide}`);
    }
  } catch (error) { return { status: 'UNVERIFIED', errors: [error.message] }; }
  const script = fileURLToPath(new URL('../skills/qwen-samkill-ui/references/upstream/reference-review/scripts/design_gate.py', import.meta.url));
  const args = [script, 'check', '--root', target, '--contract', resolve(target, 'design/gate-contract.json'), '--report', resolve(target, 'design/gate-report.json'), '--ledger', resolve(target, 'design/failure-events.jsonl')];
  let stdout;
  let code = 0;
  try { ({ stdout } = await promisify(execFile)(process.env.QWEN_PYTHON || 'python', args, { windowsHide: true, timeout: 30000, maxBuffer: 8 * 1024 * 1024 })); }
  catch (error) { stdout = error.stdout; code = error.code; }
  try {
    const result = JSON.parse(stdout);
    if (result.status === 'PASS' && code !== 0) throw new Error('Inconsistent catalog result');
    if (!['PASS', 'FAIL', 'UNVERIFIED'].includes(result.status)) throw new Error('Invalid catalog status');
    if (result.status === 'PASS' && options.reviewRequired?.length) {
      const report = JSON.parse(await readFile(resolve(target, 'design/gate-report.json'), 'utf8'));
      const unresolved = unresolvedFindings(options.reviewRequired, report, target, options.evidenceRoot);
      if (unresolved.length) return { ...result, status: 'UNVERIFIED', errors: [...(result.errors || []), 'Current automated review findings are not resolved by scoped catalog evidence'], unresolved };
    }
    return result;
  } catch { return { status: 'UNVERIFIED', errors: ['Mandatory catalog validation could not run; configure QWEN_PYTHON and inspect design/gate-contract.json and design/gate-report.json.'] }; }
}
