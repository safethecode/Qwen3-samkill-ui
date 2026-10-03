import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { skillInventory } from './skill-context.mjs';

export async function harnessBinding() {
  const root = new URL('../', import.meta.url);
  const scripts = (await readdir(new URL('scripts/', root))).filter(name => name.endsWith('.mjs')).map(name => `scripts/${name}`);
  const inventory = await skillInventory();
  const paths = [...scripts, 'evals/service-cases.mjs', 'skills/qwen-samkill-ui/SKILL.md', 'skills/qwen-samkill-ui/references/service-contracts.md', 'package-lock.json', ...inventory.sources.map(source => `skills/qwen-samkill-ui/references/upstream/${source.path}`)].sort();
  return Object.fromEntries(await Promise.all(paths.map(async path => [path, createHash('sha256').update(await readFile(new URL(path, root))).digest('hex')])));
}
