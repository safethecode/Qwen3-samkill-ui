import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStudyResume, caseResumeMode, evaluateBoundSource } from '../scripts/service-resume.mjs';

test('old results cannot be attributed to changed evaluator or fixture hashes', () => {
  const previous = { model: 'local', inferenceOptions: {}, harnessHashes: { evaluator: 'old', fixture: 'same' } };
  assert.doesNotThrow(() => validateStudyResume(previous, structuredClone(previous)));
  assert.throws(() => validateStudyResume(previous, { ...previous, harnessHashes: { evaluator: 'new', fixture: 'same' } }), /harnessHashes/);
});

test('completed generation with a transient evaluation failure resumes evaluation only', () => {
  const generated = { sourceHashes: { 'index.html': 'hash' }, contractHash: 'same', status: 'INCOMPLETE' };
  assert.equal(caseResumeMode(generated, 'same'), 'evaluate');
  assert.equal(caseResumeMode({ ...generated, checks: [{ status: 'PASS' }] }, 'same'), 'skip');
  assert.equal(caseResumeMode(undefined, 'same'), 'generate');
  assert.throws(() => caseResumeMode(generated, 'different'), /contract/);
});

test('study resume rejects changed sampling settings', () => {
  const previous = { model: 'local', inferenceOptions: {}, samplingOptions: { temperature: 0.7 }, harnessHashes: {} };
  assert.throws(() => validateStudyResume(previous, { ...previous, samplingOptions: { temperature: 0.2 } }), /samplingOptions/);
});

test('changed source cannot receive a report bound to its previous hash', async () => {
  let source = { 'index.html': 'original' };
  await assert.rejects(evaluateBoundSource(source, async () => source, async () => { source = { 'index.html': 'changed' }; return { passed: 15 }; }), /Source changed/);
  assert.deepEqual(await evaluateBoundSource(source, async () => source, async () => ({ passed: 15 })), { passed: 15 });
});
