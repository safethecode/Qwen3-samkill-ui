# Travel scaffold transfer

Status: **INCOMPLETE_REFERENCE_QUALITY**. A fresh local generation on another original service, with explicitly host-owned structure and bounded repairs. No independent design or commercial-quality approval.

Latest candidate: [source](emphasis/source), [390px render](emphasis/report/390.png), [report](emphasis/report/report.json). A final bounded typography repair restores the contract's bold location emphasis while keeping category text regular. [Exact patch](emphasis/repair/repair.json). This candidate and the preceding reflow candidate each scored40/40; the score does not distinguish that visual difference. The heading/tab enlargement and Day3 restoration were directly inspected, as was the final390px render. Extra containment diagnostics report no failures at320/390/1440px. [Comparison viewer](comparison.html).

## Source and method

[Fresh authenticated UI Bowl reference](reference.jpg), [sanitized provenance](reference.json). Retrieved2026-10-04T12:36:04Z and directly inspected. The source shows outside-card checkboxes, square place photos, compact metadata, grouped days and a partial Day3 fragment. Original CSS, font and hidden itinerary data remain unknown. Prior research photo crops are reused; production licensing remains unverified.

The experiment transfers the workshop approach to original round01. The host supplies immutable markup, actual font/icon assets and shared checkbox/card/photo/copy/grip relationships. The local model generates four bounded CSS components. No prior repaired component CSS is supplied. Shared geometry is assistance, not inferred local-model competence. [Exact plan](candidate/source/design/component-plan.json).

The first generation failed twice on a descendant sibling selector. The system prompt said sibling escapes while the validator disallowed all sibling combinators. [Failed responses](failed/generation) remain intact. The common prompt now explicitly forbids +/~ even inside the component and suggests parent gap or :not(:first-child); retry errors name the selector. Validation was not relaxed. A new run completed all four components on their first attempt. [Generation](candidate/generation). This one run establishes recovery, not a success-rate guarantee.

## Actual failures and bounded repairs

The existing repaired baseline freshly scores40/40. New generation scores37/40: enlarged text is clipped by whole-card overflow:hidden. Direct screenshot inspection also exposes a stray viewport-top border, missing Day3 photo and left-shifted footer. Passing geometry counts missed these defects. [Initial render](candidate/report/390.png), [report](candidate/report/report.json).

The partial-slot selector omitted its class dot. Correcting its position and top exposed a second issue: the18px photo was centered in a96px frame outside the18px visible window. After top alignment, its native ratio still exceeded the17px border-adjusted interior. Repairs preserve the observed fragment rather than invent hidden content. [Fragment](fragment/repair), [visibility](visible/repair), [fit and day spacing](spacing/repair).

[Text repair](text/repair) removes full-card clipping and changes fixed text line height to unitless1.36. [Footer repair](footer/repair) removes negative horizontal margin and duplicated outer spacing. [Header](heading/repair) and [tabs](reflow/repair) replace fixed heights/line heights with growing controls after enlargement revealed glyph overflow, even after ordinary checks had returned40/40. All failed and intermediate renders are retained; the intermediate31/40 and34/40 results are not discarded.

[Final source](final/source), [final mobile](final/audit/390.png), [final320px](final/audit/320.png), [source-bound report](final/audit/report.json), [geometry and additional audit](final/audit/geometry.json). Additional containment checks reject both missing fragment-owner bounds and escaping footer on the initial source. They are post-generation diagnostics, not predeclared compliance.

## Remaining limits

Static research translation: controls are explicitly disabled, no itinerary editing is implemented. Local generation still required host diagnosis and eight bounded repair calls across components. The full75-rule/eight-guide inventory remains unresolved in [catalog audit](catalog-audit/design/review-plan.json); presence of that inventory is not compliance. Font identity is a declared Noto Sans KR substitute, not recovered reference typography. Source media licensing, mobile-device zoom, interaction coverage and repeated representative parity remain unknown. No broad quality improvement is claimed merely from40/40.

Common code regression suite:140tests passed; focused component test rerun passed after diagnostic assertions. Replay: set CHROME_PATH if needed, then run node evals/results/trip-scaffold-transfer/evaluate.mjs evals/results/trip-scaffold-transfer/final/source runs/trip-transfer-replay.
