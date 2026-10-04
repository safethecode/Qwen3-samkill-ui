import { createHash } from 'node:crypto';
import { relative, resolve, sep } from 'node:path';

export function reviewFindings(issues, evidence, category) {
  return issues.filter(issue => issue.status === 'UNVERIFIED').map(issue => {
    const rules = category === 'layout' ? ['PROJECT-GUIDE-reference-to-ui'] : category === 'icons' ? [/below 24px/.test(issue.problem) ? 'PROJECT-GUIDE-reference-to-ui' : 'RUI-12'] : [/Contrast/.test(issue.problem) ? 'ORC-G11' : 'ORC-G06'];
    const id = createHash('sha256').update(JSON.stringify({ evidence, category, issue })).digest('hex');
    return { ...issue, evidence, category, id, rules };
  });
}

export function unresolvedFindings(findings, report, target, evidenceRoot) {
  return findings.filter(finding => {
    if (!finding.id || !evidenceRoot) return true;
    const evidence = relative(target, resolve(evidenceRoot, finding.evidence)).split(sep).join('/');
    return !finding.rules?.some(id => report.results?.some(entry => entry.id === id && ['pass', 'exception'].includes(entry.status) && entry.resolved_findings?.includes(finding.id) && entry.evidence?.some(item => item.path?.replaceAll('\\', '/') === evidence)));
  });
}
