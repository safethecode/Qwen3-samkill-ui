# Quality gate verification

Measured on 2026-10-03. This adds an unattended inspection/repair mechanism; it does not establish that the current local model always reproduces samkill-ui quality.

## Automated verification

49 Node/browser tests and 2 Python tests passed. New coverage includes strict review validation, missing evidence, truncated responses, functional regression rollback, stalled-repair escalation, independent confirmation disagreement, stale source binding, preservation of earlier visual scores and lock cleanup after startup failure.

An integration test runs the real browser evaluator and a local mock vision endpoint. It verifies that COMPLETE requires four image-review responses: desktop/mobile inspection and desktop/mobile audit. This proves orchestration, not a real model's judgment accuracy.

## Live local calibration

The saved [polished artifact](results/unattended/visual-polish) starts at 25/25 functional checks. References were the local upstream Round 09 desktop `first-list.png` and mobile `list-390.png`. These were development trials from existing source, not fresh-generation benchmarks. [Study record](results/quality-gate/study.json).

| Trial | Result | Interpretation |
| --- | --- | --- |
| Initial vision response | INCOMPLETE: 4,096-token limit | Truncated review cannot approve the artifact. |
| Length-bounded structured review | INCOMPLETE: visual rejection, then repair timeout | Both views returned review data; completion was refused and application source remained unchanged. |
| Identical-image positive control | INCOMPLETE: timeout | No judgment was obtained; positive-control accuracy is unknown. |

The bounded model scores were desktop 3/3/4/4/3/3 and mobile 3/2/3/4/3/2 for composition, hierarchy, spacing, typography, document content and actions. These are model opinions, not ground truth. [Review evidence](results/quality-gate/live-review.json), [repair event](results/quality-gate/live-events.json).

The reviewer incorrectly demanded replacing contract-required subtitle text with reference wording. The final prompt explicitly excludes text-copy fidelity and requires the contract to take precedence, but that final prompt's quality on a nonidentical candidate has not been established. Functional/contract checks remain necessary to reject such edits. The timeout occurred before an accepted edit; retained source was verified byte-for-byte against the starting artifact.

GPU utilization was measured at 100% with other applications active. This was not an isolated latency benchmark, and the timeout cannot be attributed solely to model capability. The gate's refusal/rollback behavior is verified; successful live end-to-end completion and reliable aesthetic calibration remain unproven.

Do not turn these outcomes into a claim that stricter gates guarantee convergence. Use the [quality workflow](../docs/QUALITY.md) to keep unmet requirements visible and to retain evidence for further calibration.
