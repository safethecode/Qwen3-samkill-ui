# Quality gate verification

## Current status — 2026-10-04

**INCOMPLETE. No candidate has demonstrated unattended samkill-ui parity.** The passing tests below verify the harness, not generated design quality. Fonts, icon assets, rendered states and the full original rule catalog were insufficiently covered by the earlier gate.

The current harness passes 111 Node/browser regression tests. Both the service and default resume routes now inspect rendered fonts and icons at 1440/390/320 pixels. Unknown findings require individual, rule-specific resolutions; acknowledging one evidence file cannot clear unrelated findings. Extra local CSS, JavaScript and font/media files participate in source freshness, and unbound dependencies cannot be served by the evaluator. Completion also requires the 75-rule catalog and eight-guide review. Review drafts are not an automatic reviewer or proof of convergence.

An independent inspection of the actual generated workshop sample found **19 failed, 30 unknown, 9 scoped passes and 17 inapplicable catalog rules**. Its eight guide assessments are **5 failed, 2 unknown and 1 inapplicable**. The saved browser evaluation is **18/27** under the recorded pre-final harness. These counts must not be compared directly with later expanded check sets. [Full scoped audit](results/rule-coverage/workshop/audit.json), [browser report](results/rule-coverage/workshop/evidence/report.json), [generated source](results/rule-coverage/workshop/source).

The broader baseline includes all seven available upstream rounds (01, 02, 03, 04, 08, 09, 10) and three independently specified services (dispatch, workshop and learning). Rounds 05–07 were absent from the available upstream material. Two generation attempts did not complete; none demonstrated visual parity. [Version-bound revalidation](results/cross-service/revalidation.json), [direct visual observations](results/cross-service/visual-observations.md), [runtime context](results/cross-service/runtime-study.json).

| Baseline case | Recorded browser checks |
| --- | --- |
| Round 01 | 12/24 |
| Round 02 | 18/24 |
| Round 03 | 17/24 |
| Round 04 | 7/27 |
| Round 08 | 18/25 |
| Round 09 | 22/26 |
| Dispatch | 15/27 |
| Learning | 13/26 |
| Workshop | Generation incomplete |
| Round 10 | Generation incomplete in baseline |

These are historical measurements from the harness hashes in the linked record, not results from the final additional dependency check. Broken assets, missing content, inaccessible workflows and visual hierarchy failures remain visible in the evidence. New generation supplies official icon assets and optional upstream local media, rejects invented asset paths, and splits navigation from forms/startup. This improves input and failure detection; it does not establish that the model now follows every rule.

## Stage-contract recovery — 2026-10-04

The new Round 02 reference-document probe completed. JavaScript was returned in the requested language, and the 2,017-token base stylesheet completed without retry under the new 2,048-token initial limit. Published-source revalidation remains **19/25**: there is no overall count improvement over the earlier completed Round 02 sample. Spatial grouping is closer to the reference, but small metadata, contrast, missing visible search labeling and incorrect footer semantics remain. This is execution recovery, not overall design parity. [Bound generation](results/stage-contract-recovery/study.json), [fresh verification](results/stage-contract-recovery/revalidation.json), [direct visual findings](results/stage-contract-recovery/visual-review.md).

A separate text-only 200% enlargement test of the earlier Round 01 source revealed an ellipsized place name at 320 pixels, beyond its basic 22/25 result. [Text-stress evidence and scope](results/static-follow-up/visual-review.md#text-stress-follow-up). Fresh Round 01/03 repetitions remain running and are not counted as successful results.

## Broader static follow-up — 2026-10-04

The pending experiments finished. Round 01 rendered four itinerary rows and scored **22/25**, reconfirmed from the published source. Direct reference comparison still finds checkboxes inside the rows, undersized photographs, missing group dates and shrinking narrow-screen text. This is below target despite the count. Round 02 with extra reference documents emitted HTML twice in its JavaScript state unit; Round 03 stopped on incorrect icon paths. Neither incomplete generation receives a visual score. [Bound results](results/static-follow-up/study.json), [direct inspection](results/static-follow-up/visual-review.md), [failed Round 02 probe](results/static-follow-up/round-02-context/study.json).

Generation now ends each prompt with the correct output-language contract instead of repeating HTML construction requirements in JavaScript/CSS stages. Wrong-language retries identify the expected file and language. Asset suggestions preserve canonical filename casing and remain ambiguous when multiple files match. The initial layout allowance is 2,048 tokens after repeated 1,536-token truncations; retry bounds and quality requirements remain in place. Fresh tests of these changes are running separately. The 111 harness regression tests establish orchestration behavior, not visual convergence.

## Static generation recovery — 2026-10-04

A fresh Round 02 run with supplied original assets failed while inventing a registration form absent from its static contract. Restricting stage instructions stopped that expansion, but the resulting page still lacked its mentor cards because startup never invoked the renderer. The runner now requires a named static renderer, calls it once, and disables sample buttons without requesting two unnecessary model-generated behavior/form stages. Interactive service stages retain their existing behavior.

The scope-only candidate scored **16/25** with no cards. A fresh lifecycle candidate renders both cards and original avatar assets and scores **19/25**, confirmed from the published source. This is a concrete content-rendering improvement, not design parity or a repeatability estimate. Typography, contrast and composition still fail; actual fonts are Malgun Gothic and Arial, with the intended role contract still missing. [Version-bound trials](results/static-generation/study.json), [direct visual inspection](results/static-generation/visual-review.md), [fresh report](results/static-generation/revalidation/report.json).

A separate probe also supplied the upstream design and analysis documents. It failed twice on incorrect icon directories despite the matching files being available. [Failed probe and document hashes](results/static-generation/design-context/study.json). Asset errors now suggest an exact supplied path only when the filename has one matching candidate; ambiguous and unavailable assets remain rejected. A new probe and fresh Round 01/03 trials are pending and are not included in the passing results above.

## Workflow repair follow-up — 2026-10-04

Ten additional bounded attempts across four batches produced **no accepted source improvement: 26/28 remains 26/28**. The batches used observed browser state (four attempts), read-only renderer context (three), Qwen3.5 27B (two), and Qwen3.6 thinking mode (one). The thinking attempt exceeded the 120-second deadline; it did not produce an accepted repair. Non-progressing edits were reverted. Booking assertions changed between batches, so this is not a controlled model ranking. [Recorded trials and source hashes](results/qwen36-workshop/workflow-recovery/study.json), [fresh final evaluation](results/qwen36-workshop/workflow-recovery/evidence/report.json).

Failures now include visible controls and panel state, and short renderers accompany HTML/JavaScript repair excerpts as read-only context. Regression coverage rejects a no-op detail button, a booking action already visible before detail, and a detail view consisting only of its heading and booking button. A selected-item detail view with descriptive information remains a positive control. These changes improve diagnostics and catch specific false passes; they do not establish semantic or visual completeness.

Direct inspection of the fresh 1440- and 390-pixel screenshots still shows an empty hero, missing pottery artwork, a detached desktop search label and a wrapping mobile brand/search label. The application source remains unchanged from the preceding retained candidate. Fonts, official-icon completeness, full catalog review and repeated representative generation remain unfinished. **The 105 harness tests are not 105 generated-design quality passes.**

## Earlier development trials

### Follow-up repair measurements — 2026-10-04

Four further local repair batches improved the existing workshop's recorded browser results from **16/28 to 26/28**. A fresh final evaluation also returns **26/28**. Font size/weight/contrast and label issues were reduced; both booking checks still fail. This is one repaired candidate, not repeated fresh-generation parity. [Source-bound study](results/qwen36-workshop/rotation-recovery/study.json), [fresh browser report](results/qwen36-workshop/rotation-recovery/evidence/report.json), [direct screenshot assessment](results/qwen36-workshop/rotation-recovery/visual-review.md).

The runner now retries missing form labels during HTML generation, fixes base presentation before downstream workflows, rejects new measurement/content regressions even when the pass count rises, and supplies whole JavaScript statements where they fit the repair budget. The last change prevents ordinary functions from being cut in the middle of identifiers; oversized or invalid statements still require explicitly marked fragments. Selecting values are not accepted as field labels.

**Visual quality is still below target.** Direct inspection finds a missing pottery illustration, an incomplete detail/booking flow and a newly crowded mobile header. The final whole-page gate remains incomplete. Earlier failed repair evidence is preserved; no candidate was reclassified as design-complete.

### Additional local model trial

Qwen3.6 35B A3B Coding completed the six-unit workshop generation in 888 seconds, including one truncated CSS attempt and retry. It scored **15/27** under its recorded startup harness. The later dependency check adds one passing check, so the repair baseline is **16/28**, not an improvement. Four bounded repair attempts retained one measured partial correction: definite font/contrast findings fell from six to three per viewport, while total passing checks stayed **16/28**. The other pending edits were rolled back. [Generation record](results/qwen36-workshop/generation-study.json), [repair result](results/qwen36-workshop/repair/result.json), [rendered candidate](results/qwen36-workshop/repair/390.png).

Direct inspection still finds a missing pottery illustration, unlabelled native search, undersized text and missing booking entry. Official icons were available to generation, but this candidate did not use them; an icon check with no icons is not proof of reference completeness. The model is experimental and has not replaced the normal OpenCode model. The repair trial exposed a repeated-unit bug: staged edits with no measured progress reset the excerpt index. A regression test reproduced it, and the runner now advances to another unit. This fix has passed targeted tests; a subsequent live convergence result is still pending.

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
