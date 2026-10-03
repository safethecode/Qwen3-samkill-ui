import { bundlePasses, visualProgress, repairStrategy, visualFailure } from './quality-policy.mjs';
import { assessProgress } from './progress.mjs';
import { PatchError } from './patches.mjs';

const functionalPasses = report => report?.total > 0 && report.passed === report.total && report.results.length === report.total && report.results.every(result => result.status === 'PASS');

export async function runQualityLoop({ rounds, inspect, snapshot, restore, repair, record }) {
  if (!Number.isInteger(rounds) || rounds < 0 || rounds > 10) throw new Error('Visual repair rounds must be 0–10');
  let current;
  let attempts = 0;
  let stalled = 0;
  const incomplete = reason => ({ status: 'INCOMPLETE', reason, attempts, inspection: current });
  try {
    current = await inspect(false);
    if (!functionalPasses(current.functional)) return incomplete('Functional gate failed');
    const protectedReviews = [current.visual];
    while (true) {
      if (bundlePasses(current.visual)) {
        const audit = await inspect(true, current);
        if (audit.binding !== current.binding) return incomplete('Source or evidence changed before confirmation');
        if (functionalPasses(audit.functional) && bundlePasses(audit.visual)) return { status: 'COMPLETE', attempts, inspection: current, confirmation: audit };
        await record({ type: 'confirmation-rejected', inspection: audit });
        if (!functionalPasses(audit.functional)) return incomplete('Functional confirmation failed');
        protectedReviews.push(audit.visual);
        current = audit;
      }
      if (attempts >= rounds) return incomplete('Visual repair budget exhausted');
      const before = await snapshot();
      const failure = visualFailure(current.visual);
      const strategy = repairStrategy(stalled);
      attempts++;
      try { await repair(failure, strategy, attempts); }
      catch (error) {
        if (error.code === 'STALE_SOURCE') return incomplete(error.message);
        await restore(before);
        await record({ type: 'repair-rejected', attempt: attempts, strategy, reason: error.message });
        if (!(error instanceof PatchError || error instanceof SyntaxError)) return incomplete(error.message);
        stalled++;
        continue;
      }
      let candidate;
      try { candidate = await inspect(false); }
      catch (error) {
        if (error.code !== 'STALE_SOURCE') await restore(before);
        throw error;
      }
      const regressions = assessProgress(current.functional, candidate.functional).regressions;
      const progress = functionalPasses(candidate.functional) && regressions.length === 0 ? visualProgress(current.visual, candidate.visual) : { accept: false, regressions };
      if (progress.accept) {
        const priorRegressions = protectedReviews.flatMap(review => visualProgress(review, candidate.visual).regressions);
        if (priorRegressions.length) { progress.accept = false; progress.regressions = [...new Set(priorRegressions)]; }
      }
      if (!progress.accept) {
        const rejected = await snapshot();
        await restore(before);
        await record({ type: 'candidate-rejected', attempt: attempts, strategy, progress, inspection: candidate, source: rejected });
        stalled++;
      } else {
        current = candidate;
        protectedReviews.push(current.visual);
        stalled = 0;
        await record({ type: 'candidate-accepted', attempt: attempts, strategy, progress, inspection: current });
      }
    }
  } catch (error) { return incomplete(error.message); }
}
