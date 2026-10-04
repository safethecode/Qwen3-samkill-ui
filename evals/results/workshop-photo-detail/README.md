# Photo-led detail study

Status: **INCOMPLETE. No reference-quality or autonomous reproducibility approval.**

The user rejected the earlier workshop render. Its arbitrary abstract hero and repeated ellipses did not preserve the reference medium or composition. Functional40/40 did not justify a visual-quality claim. This study changes the surface from the earlier catalogue to an explicitly scoped product detail; it is not a like-for-like benchmark score improvement.

## Reference and composition

Fresh authenticated UI Bowl detail query at2026-10-04T12:00:48Z returned the native Frip preview. [Sanitized provenance](reference.json), [native image](reference.jpg), [same-display-width comparison](comparison.html). An earlier list query returned no image and was not used.

Observed: large square product photo, title and price beneath, compact host region, distinct purple primary action. Chosen adaptations: pottery content, licensed Yan Krukau/Pexels photograph, local Noto Sans KR, official Lucide assets, a48px favorite column, desktop two-column composition. Original font, CSS, DPR, desktop view and hidden states remain unknown. No screenshot is used as application artwork. Photo provenance and hash are in each source assets/photos directory.

The host supplied three bounded element prompts, shared page geometry, verified font and icon assets. The local model supplied component HTML/CSS. [Exact plan](initial/source/design/component-plan.json), [raw responses and input hashes](initial/generation), [initial rendered result](initial/render/390.png). First media attempt failed root validation.

## Failures retained and repaired

The initial model put favorite above the primary action on mobile despite a two-column prompt. The existing contract missed it. A post-generation sameRow audit rejects296/320/390px; this is a diagnostic audit, not predeclared compliance. [Audit](initial/action-audit/report.json).

First bounded repair was rejected for an unchanged HTML patch. [Response](rejected-repair/response.json). Next accepted patch removed spacing and the desktop override but left one grid column: all four widths failed. [Patch](incomplete-repair/repair.json), [render](incomplete-render/390.png). A host-specified single declaration correction then made the local patch restore the two columns. [Patch and request](grid-repair), [render audit](grid-render/report.json). This required precise host diagnosis; it is not unattended design competence.

## Working candidate

An [independent generation from the same original plan](independent-repeat/generation) reproduced the stacked favorite/action defect at all four widths. [Render](independent-repeat/render/390.png), [audit](independent-repeat/render/report.json). The price audit also failed to resolve its selector because this generation chose a different class; that failure is not proof of a misplaced price. Both remain recorded. This repeat confirms that the repaired screenshot does not establish reliable generation.

[Complete interactive source](interactive/source), [mobile](interactive/render/390.png), [desktop](interactive/render/1440.png), [booking form](interactive/render/form-390.png), [persisted confirmation](interactive/render/confirmation-390.png), [source-bound report](interactive/render/report.json).

The host integrated a native dialog, form styling and demo booking/favorite/persistence behavior around the local components. No real booking or payment is offered. Four widths verify favorite toggling, empty-form rejection, persisted class/guest/date/time/price, cancellation after reload, Escape and focus restoration. Actual loaded fonts and text contrast are inspected. Structural checks and these interaction checks are not a commercial-quality score.

Replay from the repository root: set CHROME_PATH if using installed Chrome, then run node evals/results/workshop-photo-detail/capture.mjs evals/results/workshop-photo-detail/interactive/source runs/photo-detail-replay. Browser installed through Playwright also works.

## Visual judgment and limits

Directly inspected initial, failed, corrected mobile/desktop and form screenshots. Concrete improvement: actual subject photography replaces anonymous geometry; title/price metadata read separately; the primary action has a deliberate own region; mobile favorite no longer creates an empty extra row.

Still not approved: the original warm terrarium photo and compact host/avatar treatment differ, the candidate has additional explanatory copy and a brand header, and desktop is a chosen adaptation without a desktop reference. The comparison uses390 CSS px shown at296 display px; the native source CSS width is unknown. All75rules/eight guides are not certified. Text enlargement, storage-denial and full catalog navigation are outside this focused run. Repeated independent generation and other original rounds/services remain required.

Common regression suite after sameRow gate:98unit/integration tests and42browser tests passed. Those counts describe harness regression checks, not the visual quality of this candidate.
