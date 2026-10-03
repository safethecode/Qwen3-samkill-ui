export function validateStudyResume(previous, current) {
  for (const key of ['model', 'generationThinking', 'inferenceOptions', 'samplingOptions', 'harnessHashes']) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) throw new Error(`Resume requires unchanged ${key}; keep the original study or start a new one`);
  }
}

export async function evaluateBoundSource(expected, snapshot, evaluate) {
  const verify = async () => {
    const current = await snapshot();
    if (Object.keys(expected).some(name => current[name] !== expected[name])) throw new Error('Source changed during evaluation; refusing unbound results');
  };
  await verify();
  const result = await evaluate();
  await verify();
  return result;
}

export function caseResumeMode(previous, contractHash) {
  if (!previous?.sourceHashes) return 'generate';
  if (previous.contractHash !== contractHash) throw new Error('Resume contract changed');
  return Array.isArray(previous.checks) ? 'skip' : 'evaluate';
}
