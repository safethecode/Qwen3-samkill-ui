import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { checkCatalogGate } from '../scripts/catalog-gate.mjs';
import { guideChecks } from '../scripts/catalog-plan.mjs';

test('catalog approval cannot omit actual styles or a bundled guide', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-catalog-scope-'));
  await mkdir(join(target, 'design'));
  await writeFile(join(target, 'index.html'), '<html></html>');
  await writeFile(join(target, 'styles.css'), 'body{color:red}');
  await writeFile(join(target, 'design/typography.json'), JSON.stringify({ roles: [{ selector: 'p', families: ['Arial'] }] }));
  const contract = { targets: ['index.html', 'design/typography.json'], rules: Object.entries(guideChecks).map(([name, checks]) => ({ id: `PROJECT-GUIDE-${name}`, applicable: true, checks })) };
  await writeFile(join(target, 'design/gate-contract.json'), JSON.stringify(contract));
  assert.match((await checkCatalogGate(target)).errors.join(' '), /omits styles.css/);
  contract.targets.push('styles.css');
  contract.rules.pop();
  await writeFile(join(target, 'design/gate-contract.json'), JSON.stringify(contract));
  assert.match((await checkCatalogGate(target)).errors.join(' '), /Missing guide coverage/);
});
