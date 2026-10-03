import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { evaluateService } from '../scripts/service-evaluate.mjs';
import { serviceCases } from '../evals/service-cases.mjs';

test('service checks reject missing main content and mobile-only unreadable overflow', async () => {
  await mkdir('runs', { recursive: true });
  const target = await mkdtemp(resolve('runs/service-evaluator-'));
  await writeFile(resolve(target, 'index.html'), '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(max-width:400px){p{width:800px;font-size:8px}}</style></head><body><p>Unrelated placeholder</p></body></html>');
  const report = await evaluateService(target, resolve(target, 'evidence'), { id: 'test', scope: 'test fixture', anchors: ['Actual requested service'], flow: 'static' });
  assert.equal(report.visual, 'UNVERIFIED');
  for (const name of ['content-1440', 'overflow-390', 'readable-320']) assert.equal(report.checks.find(c => c.name === name).status, 'FAIL');
  assert.equal(report.checks.find(c => c.name === 'overflow-1440').status, 'PASS');
});

test('all seven available rounds and three distinct service flows remain in the benchmark', () => {
  assert.deepEqual(serviceCases.filter(c => c.entry).map(c => c.id), ['round-01', 'round-02', 'round-03', 'round-04', 'round-08', 'round-09', 'round-10']);
  assert.deepEqual(serviceCases.filter(c => !c.entry).map(c => c.flow), ['dispatch', 'booking', 'learning']);
  assert.ok(serviceCases.every(c => c.contract && c.reference && c.anchors.length >= 3));
});
