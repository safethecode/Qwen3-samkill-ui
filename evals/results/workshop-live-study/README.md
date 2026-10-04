# Live-reference workshop service study

Status: **INCOMPLETE / BELOW REFERENCE QUALITY**. This is one assisted run of an independently planned interactive service, not repeated autonomous parity. Functional counts do not approve its design.

The host supplied a workshop booking brief, semantic regions, typography intent, local font file, official Lucide assets and observed reference relationships. Qwen3.6 35B A3B generated the HTML, state, navigation, forms and CSS in six serial units. Subsequent local model calls repaired selected defects. The host diagnosed defects, selected writable scope and rejected visual regressions. This assistance is material; these results must not be described as unattended success.

## Reference and comparison scope

An authenticated UI Bowl `search_ui_patterns` call for 프립 / 예약 returned screen `clvf05mq0001ilc08yzi7iq31` on 2026-10-04 at 09:51:32 UTC. [Retrieval provenance](initial/source/assets/reference/live-retrieval.json) records the native preview hash. [The inspected preview](initial/source/assets/reference/booking-preview.jpg) shows a class thumbnail and title, an options section and payment controls. [UI Bowl screen](https://uibowl.io/name/%ED%94%84%EB%A6%BD?patterns=%EC%98%88%EC%95%BD%C2%B7%EA%B2%B0%EC%A0%9C).

The independent product borrows class-summary-before-options grouping. It does not reproduce Frip's checkout, payment controls or brand. The pottery illustration and palette were host-chosen directions, not recovered reference assets. Exact reference fonts, CSS and hidden states remain unknown. Signed download URLs and OAuth credentials are excluded.

## Preserved runs

| Stage | Checks | Finding |
| --- | --- | --- |
| [Initial generation](initial/revalidation/report.json) | 28/40 | Missing booking transition; system-font input; crowded metadata; no card illustrations. Responsive unit first repeated existing CSS and was rejected for truncation. |
| [Booking transition](transition/revalidation/report.json) | 28/40 | Form now opens; end-state font checks still fail. [Captured booking state](transition/state-review/booking-390.png). |
| [Card DOM decomposition](cards/revalidation/report.json) | 28/40 | Category, description, logistics, price and action separated; official Clock/Users assets rendered. New art nodes still have no CSS. |
| [Font fragment attempt](font-fragment-rejected/outcome.json) | Rejected | Cut CSS declaration caused invalid output; no source writes. |
| [Complete font rule](font-complete-rule/revalidation/report.json) | 37/40 | Actual control-font checks and booking validation, persistence and cancellation pass. |
| [First card CSS](card-layout-rejected/revalidation/report.json) | 37/40 | Visually rejected: data attribute assigned to wrong owner, invisible art, weak price specificity and unwanted spacing. Raw response also violates the no-comment instruction. |
| [Second card CSS](art-uncontained-rejected/revalidation/report.json) | 37/40 | Visually rejected: absolute art paints over unrelated hero/search content despite unchanged check counts. |
| [Art bounds](art-bounds/revalidation/report.json) | 37/40 | Contained illustration frame; two variant shapes still absent. |
| [Exact variant selectors](art-kinds/revalidation/report.json) | 37/40 | All three CSS silhouettes appear. Their visual execution is still below the requested quality. |

The remaining three ordinary checks report a missing visible initial `예약` content anchor at each viewport. Requirements were not removed to increase the score.

[Initial mobile rendering](initial/revalidation/390-full.png) · [Latest mobile rendering](art-kinds/revalidation/390-full.png) · [Latest desktop rendering](art-kinds/revalidation/1440-full.png).

## Geometry and visual review

A separate [post-generation layout audit](layout-audit/contract.json) requires each card's art region to be owned and visible, price below logistics, and the action below price. Initial source fails all three viewport aggregates. The art-bounds source passes these aggregates at 1440, 390 and 320: [audit report](layout-audit/repaired/revalidation/report.json), 40/43. This audit predates the final variant-selector patch and is not predeclared generation compliance. To reproduce it, copy the corresponding source and add this contract as `design/layout-contract.json` before evaluating.

Geometry does not prove the art region contains a recognizable, attractive object. Two empty color panels passed that geometry audit. Direct visual inspection remains necessary.

The host inspected the native reference, mobile/desktop renders and booking state. Outstanding deficiencies include the oversized abstract hero, repeated introductory copy, generic and faint silhouettes, excessive vertical length, incomplete booking summary, outdated footer year, and missing full rule-catalog evidence. The booking summary still lacks the media and richer selected-class context visible in the reference. No commercial-quality or parity approval is granted.

A [local vision diagnostic](art-bounds/visual-diagnostic/response.json) compared the real booking state to the reference using both images. Its result is **not accepted as approval**: it mentions price in the reference summary where the inspected preview does not establish that, and recommends grouping fields that already share a form container. It also confuses catalogue content above the booking form with its summary. Source/image hashes and the raw response are retained.

## Evidence and implementation limits

Initial and final sources include exact font/icon assets. Intermediate repair `before.json` files preserve the three source files before each applied transaction; `input.json` and `result.json` bind source and harness hashes. Rejected attempts and their original reports remain intact. To reconstruct an intermediate source, combine its recorded source files with the initial unchanged assets/contracts; do not treat an adjacent stage's report as its own.

The common repair runner now retains complete CSS statements without cutting declarations, preserving nearby inheritance context. The narrower grid repair path still retains its exact media scope. [Validation](validation.json): 137 regression tests passed. These tests verify the harness, not design parity. The 75-rule catalog and all eight upstream guides still require source-bound compliance evidence, not merely their inclusion in generation input.
