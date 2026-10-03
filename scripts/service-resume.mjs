export function validateStudyResume(previous, current) {
  for (const key of ['model', 'inferenceOptions', 'harnessHashes']) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) throw new Error(`Resume requires unchanged ${key}; keep the original study or start a new one`);
  }
}

export function caseResumeMode(previous, contractHash) {
  if (!previous?.sourceHashes) return 'generate';
  if (previous.contractHash !== contractHash) throw new Error('Resume contract changed');
  return Array.isArray(previous.checks) ? 'skip' : 'evaluate';
}
