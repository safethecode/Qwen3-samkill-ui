import test from 'node:test';
import assert from 'node:assert/strict';
import { generationPhases } from '../scripts/generate.mjs';

test('generic services do not inherit resume storage and paper contracts', () => {
  const phases = generationPhases('service');
  assert.deepEqual(Object.keys(phases), ['index.html', 'app.js', 'styles.css']);
  assert.doesNotMatch(Object.values(phases).join(' '), /archive|document content previews|editing ID|example badges/i);
  assert.match(phases['app.js'], /contract/i);
  assert.match(generationPhases('resume')['app.js'], /archive/);
  assert.throws(() => generationPhases('unknown'));
});
