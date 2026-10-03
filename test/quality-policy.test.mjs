import test from 'node:test';
import assert from 'node:assert/strict';
import { criteria, validateReview, reviewPasses, visualProgress, repairStrategy } from '../scripts/quality-policy.mjs';

const review = score => ({ criteria: criteria.map(id => ({ id, score, confidence: 0.95, observation: 'Reference and current cards have comparable spacing and alignment.' })), issues: score < 4 ? [{ criterion: 'composition', location: 'first card', problem: 'Paper does not dominate the card.', correction: 'Enlarge the document preview while preserving metadata.', files: ['styles.css'] }] : [] });

test('completion requires every criterion, adequate confidence and no unresolved issues', () => {
  assert.equal(reviewPasses(validateReview(review(4))), true);
  assert.equal(reviewPasses(validateReview(review(3))), false);
  const uncertain = review(5); uncertain.criteria[0].confidence = 0.2;
  assert.equal(reviewPasses(validateReview(uncertain)), false);
  const incomplete = review(5); incomplete.criteria.pop();
  assert.throws(() => validateReview(incomplete), /criteria/);
  const duplicate = review(5); duplicate.criteria[1].id = duplicate.criteria[0].id;
  assert.throws(() => validateReview(duplicate), /criteria/);
  const contradictory = review(5); contradictory.issues = review(3).issues;
  assert.equal(reviewPasses(validateReview(contradictory)), false);
  const bad = review(3); bad.issues[0].files = ['../outside.js'];
  assert.throws(() => validateReview(bad), /issue/);
  const blank = review(5); blank.criteria[0].observation = '';
  assert.throws(() => validateReview(blank), /observation/);
});

test('visual progress rejects tradeoffs and stalls switch from patches to complete affected files', () => {
  const before = { desktop: review(3), mobile: review(3) };
  const after = structuredClone(before); after.desktop.criteria[0].score = 4;
  assert.equal(visualProgress(before, after).accept, true);
  after.mobile.criteria[1].score = 2;
  assert.equal(visualProgress(before, after).accept, false);
  assert.equal(visualProgress(before, before).accept, false);
  assert.equal(repairStrategy(0), 'patches');
  assert.equal(repairStrategy(2), 'files');
});
