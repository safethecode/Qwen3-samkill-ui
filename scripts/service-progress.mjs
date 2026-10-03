export function serviceProgress(current, candidate) {
  const regressions = current.checks.filter(check => check.status === 'PASS' && candidate.checks.find(next => next.name === check.name)?.status !== 'PASS').map(check => check.name);
  const sameChecks = current.total === candidate.total && current.checks.every(check => candidate.checks.some(next => next.name === check.name));
  const decision = !sameChecks || regressions.length ? 'reject' : candidate.passed > current.passed ? 'accept' : 'stage';
  return { decision, regressions };
}
