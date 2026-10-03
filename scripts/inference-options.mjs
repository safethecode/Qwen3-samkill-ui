export function inferenceOptions(env = process.env) {
  const mapping = { QWEN_NUM_GPU: ['num_gpu', 0, 999], QWEN_NUM_CTX: ['num_ctx', 4096, 131072], QWEN_NUM_BATCH: ['num_batch', 1, 2048] };
  const result = {};
  for (const [name, [key, min, max]] of Object.entries(mapping)) {
    if (env[name] === undefined) continue;
    const value = Number(env[name]);
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`Invalid ${name}`);
    result[key] = value;
  }
  return result;
}
