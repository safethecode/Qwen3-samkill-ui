import test from 'node:test';
import assert from 'node:assert/strict';
import { samplingOptions } from '../scripts/sampling.mjs';

test('sampling supports explicit reproducible temperatures and rejects invalid values', () => {
  assert.deepEqual(samplingOptions('0.7'), { temperature: 0.7, top_p: 0.8, top_k: 20, repeat_penalty: 1.05 });
  assert.equal(samplingOptions('0.2').temperature, 0.2);
  assert.throws(() => samplingOptions('invalid'));
  assert.throws(() => samplingOptions('-1'));
});
