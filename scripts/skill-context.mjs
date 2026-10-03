import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const upstream = new URL('../skills/qwen-samkill-ui/references/upstream/', import.meta.url);
const routes = {
  shell: ['reference-to-ui/references/application-format.md', 'reference-to-ui/references/icon-controls.md'],
  state: ['onboarding-flow/references/flow-contract.md'],
  behavior: ['reference-review/references/state-stress.md'],
  layout: ['reference-to-ui/references/typography.md', 'reference-to-ui/references/design-guardrails.md'],
  responsive: ['reference-to-ui/references/mobile.md', 'reference-to-ui/references/icon-controls.md']
};
const digest = value => createHash('sha256').update(value).digest('hex');

export async function stageSkillContext(stage) {
  if (!routes[stage]) throw new Error(`Unknown skill stage: ${stage}`);
  const sources = await Promise.all(routes[stage].map(async path => ({ path, text: await readFile(new URL(path, upstream), 'utf8') })));
  return { text: sources.map(source => `UPSTREAM RULES ${source.path}\n${source.text}`).join('\n\n'), sources: sources.map(({ path, text }) => ({ path, sha256: digest(text) })) };
}

export async function skillInventory() {
  const sources = [];
  const visit = async path => {
    for (const entry of await readdir(new URL(path, upstream), { withFileTypes: true })) {
      const name = `${path}${entry.name}`;
      if (entry.isDirectory()) await visit(`${name}/`);
      else if (/\.(md|json)$/.test(name)) sources.push({ path: name, sha256: digest(await readFile(new URL(name, upstream))) });
    }
  };
  await visit('');
  const catalog = JSON.parse(await readFile(new URL('reference-review/references/failure-catalog.json', upstream), 'utf8'));
  return { sources: sources.sort((a, b) => a.path.localeCompare(b.path)), catalogVersion: catalog.version, rules: catalog.rules.filter(rule => rule.status === 'active'), routes, limitation: 'Stage routing supports generation, not full compliance. Every active rule and relevant guide still requires scoped evidence in the mandatory catalog review.' };
}
