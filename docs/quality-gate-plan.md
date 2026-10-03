# Quality gate implementation plan

Implementation uses the writing-plans and executing-plans workflow in the current authorized checkout. User requested autonomous execution and granular commits.

Spec: [quality-gate-design.md](quality-gate-design.md).

Constraints: Node 22+, existing Playwright/Ollama stack, sequential local inference, no new dependencies, no code comments, no personal paths, no changes to historical scores.

- [x] Add strict review policy and regression tests for missing criteria, low confidence, malformed issues, disagreement, regressions and strategy escalation.
- [x] Add local vision reviewer with capability preflight, reference/image validation, immutable hashes and separate audit requests; test actual request structure with a local mock response.
- [x] Add bounded quality orchestration and CLI with rollback, evidence, source binding, functional rechecks and two-pass final confirmation; exercise failures and termination.
- [x] Run existing suites and real local visual evaluation/repair, inspect screenshots, document calibration and limitations.
- [x] Review final changes, update usage and installed skill, commit separately and push.

Review focus: malformed model JSON, a reviewer approving visibly defective output, source edits during inference, missing or changed references, and repair/evaluator failures after mutation.

Execution ledger: scoped to the existing resume evaluator; other applications need their own functional evaluator. The quality runner must not imply that arbitrary OpenCode chat is automatically gated.

Ruling: preserve all prior accepted/audit criterion baselines after reviewer disagreement; a lower rejected audit cannot make a regressing repair acceptable. Startup filesystem failures release the target lock. Both fixes have red-to-green regression tests.

Verification: 49 Node/browser tests and 2 Python tests passed. Live review refused completion on truncation; a bounded review rejected the saved 25/25 artifact and its repair timed out with unchanged source. An identical-image positive control also timed out. These are recorded limitations, not successful unattended design completion.
