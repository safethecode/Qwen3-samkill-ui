export const criteria = ['composition', 'hierarchy', 'spacing', 'typography', 'document-content', 'actions'];
export const viewports = ['desktop', 'mobile'];
const text = value => typeof value === 'string' && value.trim().length >= 8 && value.length <= 2000;

export function validateReview(value) {
  if (!value || !Array.isArray(value.criteria) || value.criteria.length !== criteria.length || new Set(value.criteria.map(item => item.id)).size !== criteria.length) throw new Error('Invalid review criteria');
  for (const item of value.criteria) {
    if (!criteria.includes(item.id) || !Number.isInteger(item.score) || item.score < 1 || item.score > 5 || !Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1) throw new Error('Invalid review criteria score/confidence');
    if (!text(item.observation)) throw new Error('Missing visual observation');
  }
  if (!Array.isArray(value.issues) || value.issues.length > 12) throw new Error('Invalid review issues');
  for (const issue of value.issues) {
    if (!criteria.includes(issue.criterion) || !text(issue.location) || !text(issue.problem) || !text(issue.correction) || !Array.isArray(issue.files) || !issue.files.length || issue.files.some(path => !['index.html', 'styles.css', 'app.js'].includes(path))) throw new Error('Invalid visual issue');
  }
  return value;
}

export function reviewPasses(review) {
  validateReview(review);
  return review.issues.length === 0 && review.criteria.every(item => item.score >= 4 && item.confidence >= 0.8);
}

export const bundlePasses = bundle => viewports.every(view => reviewPasses(bundle[view]));
export const repairStrategy = stalled => stalled >= 2 ? 'files' : 'patches';

export function visualProgress(before, after) {
  const regressions = [];
  let improved = false;
  for (const view of viewports) {
    validateReview(before[view]); validateReview(after[view]);
    for (const old of before[view].criteria) {
      const next = after[view].criteria.find(item => item.id === old.id);
      if (next.score < old.score || (old.confidence >= 0.8 && next.confidence < 0.8)) regressions.push(`${view}:${old.id}`);
      if (next.score > old.score || (old.confidence < 0.8 && next.confidence >= 0.8)) improved = true;
    }
    if (after[view].issues.length > before[view].issues.length) regressions.push(`${view}:issues`);
    if (after[view].issues.length < before[view].issues.length) improved = true;
  }
  return { accept: improved && regressions.length === 0, regressions, improved };
}

export function visualFailure(bundle) {
  for (const view of viewports) {
    const review = validateReview(bundle[view]);
    if (reviewPasses(review)) continue;
    const issue = review.issues[0];
    const criterion = [...review.criteria].sort((a, b) => a.score - b.score || a.confidence - b.confidence)[0];
    return { name: 'visual-review', status: 'FAIL', view, files: issue?.files || ['styles.css'], detail: issue ? `${view}, ${issue.criterion}, ${issue.location}: ${issue.problem} Required correction: ${issue.correction}` : `${view}, ${criterion.id}: ${criterion.observation}. The reviewer could not confirm this criterion at the required quality/confidence. Preserve all other criteria and functionality.` };
  }
  throw new Error('No visual failure to repair');
}
