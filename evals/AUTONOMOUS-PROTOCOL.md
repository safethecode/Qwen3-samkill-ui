# Unattended workflow evaluation

This protocol tests whether the local runner can complete the resume fixture without operator diagnoses, source edits or intermediate feedback. It does not certify general coding ability, ordinary OpenCode chat reliability, or visual equivalence to the upstream product.

## Procedure

1. Start each trial in a fresh directory containing only DESIGN.md and the declared REFERENCE.md. Never copy a finished application or a previous model output.
2. Freeze the runner, evaluator, skill, contract, model settings and ten-round budget for the batch. Record their source hashes and sampling parameters.
3. Generate HTML, JavaScript and CSS in separate validated local responses. Run the independent browser evaluator, feed its actual failures back to the repair model and retain every attempt locally.
4. Reject malformed, incomplete, ambiguous, unchanged and stale responses. Accept a candidate only if it fixes at least one failed check without losing any previously passing check; otherwise restore the previously accepted files.
5. Record first-generation and final retained scores separately. A rejected candidate is not the final artifact. A failed process is not a completed trial even if a later independent check succeeds.
6. Run two original-contract trials and one declared content/color/width variant. Do not change implementation or model settings during these three trials.
7. Re-evaluate the retained files independently. Inspect final desktop and mobile screenshots separately from automated scores.

The target is at least two completely passing invocations out of three without operator repair. Report all trials, including failures and interrupted experiments. Three trials are a small operational sample, not a statistical reliability estimate. Missing the target must remain visible in the results.

## Current configuration

The direct Ollama backend uses Qwen3 Coder 30B for generation and Qwen3.5 9B for bounded repairs, with thinking disabled, temperature 0.7, top-p 0.8, top-k 20, repetition penalty 1.05, context 32768 and an 8192-token output budget. The portable model name is qwen-ui; the measured machine used its existing qwen-local-dev alias. No cloud model generates or repairs application source during an unattended invocation.

Repairs start with up to three exact replacements, each matching at most 4,000 characters and replacing at most 8,000. Failed attempts can switch to complete affected files, which must parse before saving. Current source takes precedence over failed responses; rejected source code is excluded from the next prompt. Every accepted candidate is checked in the browser. Rotating to a different failed check clears unrelated retry context; same-check retries retain their own errors.

Scores include deterministic parsed-comment removal and typography normalization. These are host operations, not model reasoning. The typography normalizer attempts the contract minimum once per viewport failure, preserving larger and bolder control styles; unresolved cases return to the model.

Version 9 has 25 checks, or 28 for the declared variant. Search is evaluated in an isolated browser context, with bounded waits for input-driven or submitted filtering. The remaining checks include visible field and placeholder typography, desktop columns, mobile stacking and actual document content on white paper surfaces. Reports retain visualReview: UNVERIFIED because geometry and interaction assertions do not certify aesthetics.

## Evidence interpretation

The [results](UNATTENDED-RESULTS.md) preserve completed trials and development pilots. Pilots started from previous artifacts, diagnostic replay and operator visual feedback are labeled separately. They are not fresh-generation successes. Raw local responses remain under ignored run directories; published summaries and reports exclude personal machine paths.

| Evaluator | Scope and correction |
| --- | --- |
| v3 | Historical 19-check functional fixture; the original 19/19 artifact was assisted. |
| v4 | Added six measurable design checks and three variant assertions; a batch was interrupted after a filter-control assumption was found. |
| v5 | Accepted either button or select filters. The numbered-repair batch completed zero of three trials. |
| v6 | Added form/placeholder typography and full desktop spacing assertions without changing totals. The frozen release batch used this version. |
| v7 | Isolates search state and accepts submission/debounce. Unchanged-artifact rechecks must be separated from v6 scores and from new model repairs. |
| v9 | Adds clipping and opaque-overlap checks for sample badges at desktop and mobile widths. The unchanged first v8 output falls from 25/25 to 24/25. This remains a geometric/paint-style heuristic, not pixel-level visual certification. |
| v8 | Requires sample status on each card and distinguishes card badges from form labels, and personal names from document titles, in failure feedback. Totals remain 25/28. |

The v6 search check required immediate filtering even though the contract did not. Failure could also leave its query active during creation, causing a false creation failure. Re-evaluating an unchanged artifact from 21/25 to 23/25 under v7 is an evaluator correction, not a model improvement. The browser regression suite covers broken search, missing empty-state copy, Enter/form submission, delayed filtering and avoiding unwanted submission of already-working search.

Do not combine different evaluator versions as one metric. Changes in prompting, sampling, orchestration and model selection were combined during development, so the study cannot attribute improvement to the skill or temperature alone. A passing fixture still requires screenshot review, and neither outcome establishes full reference parity.
