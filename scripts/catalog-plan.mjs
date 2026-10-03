import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { skillInventory } from './skill-context.mjs';

export const guideChecks = {
  'samkill-ui': ['spec', 'code', 'visual', 'interaction'],
  'uibowl-research': ['spec', 'visual'],
  'reference-decompose': ['spec', 'visual'],
  'design-md': ['spec'],
  'reference-to-ui': ['spec', 'code', 'visual', 'interaction'],
  'reference-review': ['spec', 'code', 'visual', 'interaction'],
  'ux-copy': ['spec', 'visual', 'interaction'],
  'onboarding-flow': ['spec', 'interaction']
};

export async function prepareCatalogPlan(target) {
  const directory = resolve(target, 'design');
  await mkdir(directory, { recursive: true });
  const path = resolve(directory, 'review-plan.json');
  const inventory = await skillInventory();
  const rules = inventory.rules.map(rule => ({ id: rule.id, title: rule.title, original: rule.original, checks: rule.checks, source: rule.source, applicability: 'UNVERIFIED', status: 'unknown', evidence: [] }));
  const guides = inventory.sources.filter(source => source.path.endsWith('/guide.md')).map(source => ({ ...source, id: `PROJECT-GUIDE-${source.path.split('/')[0]}`, checks: guideChecks[source.path.split('/')[0]], status: 'unknown', evidence: [] }));
  const plan = { schema_version: 1, catalog_version: inventory.catalogVersion, rules, guides, sourceInventory: inventory.sources, instructions: 'Review each original rule and guide in project context. Preserve all check kinds. Record applicability, exceptions and evidence in gate-contract.json and gate-report.json. This inventory is not a passing report.' };
  if (await access(path).then(() => true, () => false)) {
    const existing = JSON.parse(await readFile(path, 'utf8'));
    if (JSON.stringify(existing.sourceInventory) !== JSON.stringify(plan.sourceInventory)) throw new Error('Upstream review plan changed; preserve prior evidence and explicitly migrate the plan');
    return existing;
  }
  await writeFile(path, JSON.stringify(plan, null, 2), { flag: 'wx' });
  return plan;
}
