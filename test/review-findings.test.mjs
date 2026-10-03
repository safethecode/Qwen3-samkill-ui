import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewFindings, unresolvedFindings } from '../scripts/review-findings.mjs';

test('one icon approval cannot resolve fonts or contrast sharing its evidence file', () => {
  const evidence = 'workflow.json';
  const fonts = reviewFindings([{ status: 'UNVERIFIED', problem: 'Contrast requires rendered review' }, { status: 'UNVERIFIED', problem: 'Intended typography roles missing' }], evidence, 'fonts');
  const icons = reviewFindings([{ status: 'UNVERIFIED', problem: 'SVG provenance unknown' }], evidence, 'icons');
  const findings = [...fonts, ...icons];
  const report = { results: [{ id: 'RUI-12', status: 'pass', evidence: [{ path: 'evidence/workflow.json' }], resolved_findings: findings.map(finding => finding.id) }] };
  assert.deepEqual(unresolvedFindings(findings, report, '/target', '/target/evidence'), fonts);
  delete report.results[0].resolved_findings;
  assert.equal(unresolvedFindings(findings, report, '/target', '/target/evidence').length, 3);
  assert.deepEqual(fonts.map(finding => finding.rules), [['ORC-G11'], ['ORC-G06']]);
});
