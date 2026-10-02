const priority = ['javascript-syntax', 'runtime-errors', 'visible-labels-and-create', 'create-after-edit', 'reload-persistence', 'archive-and-restore', 'duplicate', 'search-label-and-empty-state', 'three-example-documents', 'required-title-validation', 'user-content-is-text'];

export function selectFailure(report, attempts = {}) {
  const rank = name => {
    if (name.startsWith('file:')) return -2;
    if (name === 'no-code-comments') return -1;
    const index = priority.indexOf(name);
    return index < 0 ? priority.length : index;
  };
  return report.results.filter(check => check.status === 'FAIL').sort((a, b) => Math.floor((attempts[a.name] || 0) / 2) - Math.floor((attempts[b.name] || 0) / 2) || rank(a.name) - rank(b.name))[0];
}

export function selectRepair(report, attempts, previousFailure, previousError) {
  const failure = selectFailure(report, attempts);
  return { failure, previousError: failure?.name === previousFailure?.name ? previousError : '' };
}
