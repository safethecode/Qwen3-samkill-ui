import test from 'node:test';
import assert from 'node:assert/strict';
import { inferenceOptions } from '../scripts/inference-options.mjs';

test('resource overrides are optional, explicit and bounded', () => {
  assert.deepEqual(inferenceOptions({}), {});
  assert.deepEqual(inferenceOptions({ QWEN_NUM_GPU: '16', QWEN_NUM_CTX: '8192', QWEN_NUM_BATCH: '128' }), { num_gpu: 16, num_ctx: 8192, num_batch: 128 });
  assert.deepEqual(inferenceOptions({ QWEN_NUM_GPU: '0' }), { num_gpu: 0 });
  for (const value of ['abc', '-1', '2.5', '1000']) assert.throws(() => inferenceOptions({ QWEN_NUM_GPU: value }));
});
