import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStudyResume, caseResumeMode } from '../scripts/service-resume.mjs';

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
