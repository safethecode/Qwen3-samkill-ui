import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { appendIconVariant } from '../../scripts/icon-assets.mjs';
import { repairComponent } from '../../scripts/repair-component.mjs';
import { evaluateService } from '../../scripts/service-evaluate.mjs';
import { serviceCases } from '../evals/service-cases.mjs';
const root = 'runs/mentor-header-common';
const target = `${root}/source`;
await mkdir(root, { recursive: true });
await cp('evals/results/mentor-footer-repair/source', target, { recursive: true, force: false, errorOnExist: true });
const plan = JSON.parse(await readFile(`${target}/design/component-plan.json`, 'utf8'));
const element = plan.elements.find(item => item.id === 'E1');
for (const name of ['Bell', 'Heart', 'UserRound']) {
  const file = await appendIconVariant(target, { name, variant: 'quiet', fill: '#cfd6d9', stroke: '#cfd6d9' });
  element.assets.push(`assets/icons/${file}`);
}
await writeFile(`${target}/design/component-plan.json`, JSON.stringify(plan, null, 2));
const checkpoint = JSON.parse(await readFile('evals/results/decomposed-mentor-v3/generation/component-checkpoint.json', 'utf8'));
const failure = 'Reference header tools are pale neutral secondary silhouettes. Candidate tools are black outlines competing with the title. Host has prepared official-geometry paint variants: assets/icons/Bell-quiet.svg, assets/icons/Heart-quiet.svg, assets/icons/UserRound-quiet.svg. Replace the three corresponding img src values only. Keep all text, order, layout, sizes and CSS unchanged. These are noninteractive static prototype illustrations. Chosen paint is an adaptation, not a measured original color. Do not change any other element.';
await repairComponent(target, `${root}/repair`, 'E1', checkpoint.completed.E1, failure);
const report = await evaluateService(target, `${root}/revalidation`, serviceCases.find(item => item.id === 'round-02'), { textStress: true });
console.log({ passed: report.passed, total: report.total });
