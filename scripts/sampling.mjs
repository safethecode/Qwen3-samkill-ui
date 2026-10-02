export function samplingOptions(temperature = process.env.QWEN_TEMPERATURE ?? '0.7') {
  const value = Number(temperature);
  if (!Number.isFinite(value) || value < 0 || value > 2) throw new Error('QWEN_TEMPERATURE must be a number between 0 and 2');
  return { temperature: value, top_p: 0.8, top_k: 20, repeat_penalty: 1.05 };
}
