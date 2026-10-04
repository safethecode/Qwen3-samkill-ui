# Quality gate verification

## Current status — 2026-10-04

A fresh live UI Bowl comparison round improved the narrow itinerary row from a measured 156px to 131px while preserving all copy and minimum type size. The first attempt failed enlarged-text clipping; the next passed checks but changed wider layout and was rejected in review; an overlapping patch was rejected before writes. The final scoped retry passes 40/40, with identical before/after screenshot hashes at 390px and 1440px. This is a limited responsive improvement, not reference parity. [Full staged evidence and measured comparison](results/trip-responsive-study/README.md).

The travel itinerary trial resumed after the competing inference ended. All four fixed-markup components generated, but direct rendering exposed completely clipped photos that the old asset-load check missed. A bounded local repair restored the photos and partial Day3 crop. Under the new rectangular media-visibility check, the failed source scores 31/40 and the repaired source 40/40. Both old and new harness evaluations are retained. The 320px long row remains too tall relative to the reference; this is not parity. [Generation failure](results/trip-components-resumed/visual-review.md), [repair and visual limits](results/trip-photo-repair/visual-review.md).

The reusable semantic repair runner now applies the same bounded element patch to assembly and standalone samples while rejecting stale source, escaping selectors and truncated replies. Its full regression suite passes 134 tests. Two real local-model runs improved header hierarchy and second-card metadata grouping; each retained 40/40 browser checks. At 320px the corrected certification/expertise group now fits on one line. Host defect selection and asset preparation are still assistance; no automated convergence or reference parity is claimed. [Header comparison](results/mentor-header-common/visual-review.md), [metadata comparison and remaining defects](results/mentor-metadata-common/visual-review.md).

A further local repair connected a verified official-geometry filled Heart asset and selected-state semantics (43.98 seconds). A second repair matched the consultation surface between cards (17.28 seconds). Each retains 40/40 browser checks; direct 390/320 renders show these scoped improvements. Header icons, metadata consistency, real product interactions and full reference/catalog approval remain unfinished. The icon variant exporter passes the expanded 132-test regression suite. [Selected-state repair](results/mentor-icon-repair/visual-review.md), [surface consistency and remaining visual defects](results/mentor-footer-repair/visual-review.md).

Two subsequent bounded local-model repairs corrected the duplicate identity paragraph and 12px badge (49.3 seconds), then removed the category chips' unwanted borders/shadows (15.2 seconds). The same expanded suite improved from 34/40 to 40/40 and stayed there. The host selected the elements and defects; the model supplied exact patches, reused in assembly and samples. These are assisted repairs of one static case, not unattended convergence. Selected icon state, metadata consistency and reference fidelity remain unresolved. [Identity repair](results/mentor-element-repair/visual-review.md), [chip repair and mobile comparison](results/mentor-chip-repair/visual-review.md).

The latest semantic decomposition trial completed seven elements with fixed HTML assistance for search and card bodies. Its original browser result is 34/37; all 21 sample/assembly width comparisons agree. The subsequent expanded layout audit is 34/40 and correctly rejects an invented description inside the identity region at all three widths. Typography, selected icon appearance and inconsistent card actions remain below the reference. [Direct review](results/decomposed-mentor-v3/visual-review.md), [post-generation layout audit](results/decomposed-mentor-layout-audit/README.md). The skill now requires semantic ownership and layout contracts; the browser gates enforce declared containment, separation, row density and sample widths. These measurements do not approve visual quality.

A fresh font-intent trial exposed another gap: a matching installed font can satisfy the family-name check while the supplied local font file is never loaded. Generation now receives the predeclared role contract. A bounded local-model follow-up added the missing loading rule, but the font's internal platform name differs from its CSS family, leaving strict role checks failed. The original contract and failures are preserved. Visible-label and enlargement defects also remain. [Font trial and rendered comparison](results/font-intent-generation/visual-review.md).

**INCOMPLETE. No candidate has demonstrated unattended samkill-ui parity.** The passing tests below verify the harness, not generated design quality. Fonts, icon assets, rendered states and the full original rule catalog were insufficiently covered by the earlier gate.

The current harness passes 122 Node/browser regression tests. Both the service and default resume routes now inspect rendered fonts and icons at 1440/390/320 pixels. Unknown findings require individual, rule-specific resolutions; acknowledging one evidence file cannot clear unrelated findings. Extra local CSS, JavaScript and font/media files participate in source freshness, and unbound dependencies cannot be served by the evaluator. Completion also requires the 75-rule catalog and eight-guide review. Review drafts are not an automatic reviewer or proof of convergence.

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

## Explicit mobile navigation requirement — 2026-10-04

The Learning brief's mobile stacking requirement now participates in bounded CSS repair. Adding its two viewport checks exposes the unchanged prior39/39 source as **39/41**. Two local runs from that same source each reached **41/41 on the first attempt**, confirmed by fresh published-source revalidation. The rendered week groups and lesson buttons now stack vertically. [Source-bound runs and direct observations](results/semantic-stack/visual-review.md).

This is a scoped layout improvement. The navigation remains tall and week headings are not interactive controls; compactness, search-label wrapping, font intent and complete guide/catalog coverage are still unresolved. The120 harness tests do not establish overall generated-design quality.

## Grid reflow investigation — 2026-10-04

Learning started at **38/39**. A host-only counterfactual confirmed the intrinsic grid constraint. The actual broad-excerpt repair failed four times; complete CSS rule units then reached **39/39 in three attempts**. After preserving original indentation, another local run changed only the mobile track to `minmax(0, 1fr)` and reached **39/39 on its first attempt**. Both published outputs were independently revalidated. Horizontal navigation, font intent and overall design/catalog approval remain unresolved. [Bound experiments and limitations](results/grid-reflow/visual-review.md).

## Intrinsic flex repair — 2026-10-04

A measured root-cause probe identified the search input's intrinsic minimum width as the cause of Round 02 enlarged-text overflow. The host counterfactual is recorded separately from the actual local-model run. With computed flex constraints supplied first in its feedback, Qwen produced the correct `min-width: 0` patch on its **first attempt: 35/37 to 37/37**, confirmed by published-source revalidation. It did not hide overflow or remove content. [Source-bound experiment and direct inspection](results/flex-reflow/visual-review.md).

This is a specific repair improvement. Descriptions still truncate, metadata/footer composition remains poor and intended font/catalog approval is missing. **No design parity is claimed.** A second repair from the unchanged original also passed37/37 on its first attempt and was independently revalidated. Learning improved33/39 to38/39 by fixing placeholder contrast; its enlarged-text layout remains broken after three further attempts. All116 harness tests passed.

## Enlarged-text repair integration — 2026-10-04

Service benchmark, revalidation, repair and quality routes now include twelve text enlargement/spacing overflow and ancestor-clipping checks. Bounded repair receives observed element geometry and continues past ordinary functional passes. Clipping and overlap remain explicit review requirements; zero page overflow is not visual approval. The full 115-test suite passed, followed by five targeted route checks after integration.

Two subsequent four-attempt local repair batches, including one with explicit previous-attempt feedback, retained **no source improvement: 35/37 remains 35/37**. Masking patches were rejected and provisional edits rolled back. The final feedback change passed all four bounded-repair regression tests, including rejection, feedback and a valid wrapping repair. Actual model convergence remains unproven.

Fresh Dispatch generation failed twice on a missing visible search label. Learning completed at **22/27** under its generation harness; unchanged-source revalidation with twelve additional stress checks gives **33/39**, including a new 320-pixel enlargement failure. Direct screenshots still show broken mobile labeling/navigation and unresolved typography intent. Round 02's initial stress-only loop produced a false **31/31** by adding hidden overflow. Direct inspection rejected it. With ancestor clipping included, both the original and masked versions score **35/37**, but the masked candidate introduces four clipped elements at each narrow width and is rejected as a regression. A fresh repair starts from the original source. [Evidence and direct observations](results/text-stress-recovery/visual-review.md).

## Typography foundation and layout regression — 2026-10-04

Controlled copies of three local outputs improved in basic checks after auditable host typography normalization: Round 01 **19/25 to 22/25**, Round 02 **19/25 to 22/25**, and Round 03 **22/25 to 25/25**. Two bounded local contrast repairs then brought Round 02 to **25/25**, confirmed from the published source. The normalizer now preserves tokens shared with spacing. Original model responses and before/after source hashes remain available.

**These artifacts remain INCOMPLETE.** Direct enlarged-text inspection finds clipping, overlaps and broken narrow layouts. Round 02 horizontal scroll width at 200% text worsened from 395 to 415 pixels at width 390, and from 389 to 409 at width 320 after normalization. Intended font roles, complete icon coverage and catalog approval are still missing. The current functional repair loop stopping at 25/25 does not resolve these failures. [Measured comparison and visual findings](results/typography-foundation/visual-review.md), [fresh repaired-source verification](results/typography-foundation/contrast-repair/revalidation.json).

## Stage-contract recovery — 2026-10-04

The new Round 02 reference-document probe completed. JavaScript was returned in the requested language, and the 2,017-token base stylesheet completed without retry under the new 2,048-token initial limit. Published-source revalidation remains **19/25**: there is no overall count improvement over the earlier completed Round 02 sample. Spatial grouping is closer to the reference, but small metadata, contrast, missing visible search labeling and incorrect footer semantics remain. This is execution recovery, not overall design parity. [Bound generation](results/stage-contract-recovery/study.json), [fresh verification](results/stage-contract-recovery/revalidation.json), [direct visual findings](results/stage-contract-recovery/visual-review.md).

A separate text-only 200% enlargement test of the earlier Round 01 source revealed an ellipsized place name at 320 pixels, beyond its basic 22/25 result. [Text-stress evidence and scope](results/static-follow-up/visual-review.md#text-stress-follow-up). Those fresh repetitions subsequently completed at 19/25 and 22/25; their typography follow-up is recorded above.

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
