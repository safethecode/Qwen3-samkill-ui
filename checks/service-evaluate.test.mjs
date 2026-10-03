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

test('a hidden duplicate heading does not hide a visible required action from the evaluator', async () => {
  const target = await mkdtemp(resolve('runs/service-visible-anchor-'));
  await writeFile(resolve(target, 'index.html'), '<html><body><h2 hidden>새 요청</h2><button>새 요청</button></body></html>');
  const report = await evaluateService(target, resolve(target, 'evidence'), { id: 'duplicate-anchor', scope: 'test fixture', anchors: ['새 요청'], flow: 'static' });
  assert.ok(report.checks.filter(check => check.name.startsWith('content-')).every(check => check.status === 'PASS'));
});

test('reference capture rejects a missing HTTP entry instead of saving blank evidence', async () => {
  const target = await mkdtemp(resolve('runs/service-missing-reference-'));
  await assert.rejects(evaluateService(target, resolve(target, 'evidence'), { id: 'missing' }, { reference: true, entry: 'missing.html' }), /HTTP 404|HTTP_RESPONSE_CODE_FAILURE/);
  await writeFile(resolve(target, 'empty.html'), '<html><body></body></html>');
  await assert.rejects(evaluateService(target, resolve(target, 'empty-evidence'), { id: 'empty' }, { reference: true, entry: 'empty.html' }), /body is empty/);
});

test('a global completed label cannot pass a no-op ticket completion handler', async () => {
  const target = await mkdtemp(resolve('runs/service-broken-complete-'));
  await writeFile(resolve(target, 'index.html'), `<html><body><h1>Test</h1><p>예시 · 완료 0</p><label for="search">검색</label><input id="search"><button>새 요청</button><form id="ticket-form"><input id="title"><input id="space"><select id="priority"><option>긴급</option></select><input id="assignee"><button>등록</button></form><button id="show">상세</button><div id="detail"></div><script>document.querySelector('form').onsubmit=e=>{e.preventDefault();localStorage.setItem('ticket',document.querySelector('#title').value)};document.querySelector('#show').onclick=()=>{document.querySelector('#detail').textContent=localStorage.getItem('ticket')+' 대기';const b=document.createElement('button');b.textContent='처리 완료';document.querySelector('#detail').append(b)};</script></body></html>`);
  const report = await evaluateService(target, resolve(target, 'evidence'), { id: 'broken-complete', scope: 'test fixture', anchors: ['Test', '예시', '완료 0'], flow: 'dispatch' });
  const failure = report.checks.find(c => c.name === 'ticket-create-complete-persist');
  assert.equal(failure.status, 'FAIL');
  assert.match(failure.detail, /must not remain actionable|no persisted completion/);
});

test('a static search-results heading cannot hide a nonfunctional search', async () => {
  const target = await mkdtemp(resolve('runs/service-broken-search-'));
  await writeFile(resolve(target, 'index.html'), '<html><body><h1>Test</h1><label for="search">검색</label><input id="search"><h2>검색 결과</h2><button>상세</button><p>예시</p></body></html>');
  const report = await evaluateService(target, resolve(target, 'evidence'), { id: 'broken-search', scope: 'test fixture', anchors: ['Test', '검색 결과', '예시'], flow: 'dispatch' });
  const failure = report.checks.find(c => c.name === 'search-empty-recovery');
  assert.equal(failure.status, 'FAIL');
  assert.match(failure.detail, /did not remove/);
});
