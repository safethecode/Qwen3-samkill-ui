export function serviceProgress(current, candidate) {
  const regressions = current.checks.filter(check => check.status === 'PASS' && candidate.checks.find(next => next.name === check.name)?.status !== 'PASS').map(check => check.name);
  const sameChecks = current.total === candidate.total && current.checks.every(check => candidate.checks.some(next => next.name === check.name));
  const measured = Object.entries(current.measurements || {});
  const invalidMeasurements = measured.some(([name, value]) => !Number.isInteger(value) || value < 0 || !Number.isInteger(candidate.measurements?.[name]) || candidate.measurements[name] < 0);
  const worsened = measured.some(([name, value]) => candidate.measurements?.[name] > value);
  const improved = measured.some(([name, value]) => candidate.measurements?.[name] < value);
  const contentLost = Object.entries(current.contentInventory || {}).some(([width, texts]) => Object.entries(texts).some(([text, count]) => (candidate.contentInventory?.[width]?.[text] || 0) < count));
  const decision = !sameChecks || regressions.length || invalidMeasurements || worsened || contentLost ? 'reject' : candidate.passed > current.passed || improved ? 'accept' : 'stage';
  return { decision, regressions };
}
