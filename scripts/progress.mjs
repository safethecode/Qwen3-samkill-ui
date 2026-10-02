export function assessProgress(before, after) {
  const previous = new Map(before.results.map(check => [check.name, check.status]));
  const current = new Map(after.results.map(check => [check.name, check.status]));
  const regressions = [...previous].filter(([name, status]) => status === 'PASS' && current.get(name) !== 'PASS').map(([name]) => name);
  const fixed = [...previous].filter(([name, status]) => status === 'FAIL' && current.get(name) === 'PASS').map(([name]) => name);
  return { accept: regressions.length === 0 && fixed.length > 0, regressions, fixed };
}
