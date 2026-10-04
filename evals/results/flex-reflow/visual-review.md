# Intrinsic flex constraint recovery

Overall status: **INCOMPLETE**. This repairs a specific enlarged-text defect, not the full design or catalog.

## Diagnosis and measured repair

The unchanged Round 02 source scores **35/37**. At 200% text, its search input retains a computed `min-width: auto` and is 343 pixels wide. At the 390-pixel viewport, its flex parent is 358 pixels wide but has 399 pixels of scrollable content. Previous model attempts repeatedly changed outer containers or hid overflow instead of correcting this input constraint.

A controlled host counterfactual added only `#search { min-width: 0; }` on a source copy and reached **37/37**. This is explicitly a diagnosis experiment, not local-model output. [Before/after source bindings and measurements](diagnostic/study.json).

The repair runner now places the computed flex item's ID, minimum width, shrink factor and parent geometry at the beginning of the failure feedback. The local Qwen model then independently produced a one-line `min-width: 0` addition inside the existing search rule on its **first repair attempt**, improving **35/37 to 37/37** without hidden overflow or content removal. Fresh evaluation of the published source confirms the result. [Actual response](local-repair/steps/attempt-1/repair-response.json), [fresh verification](local-repair/study.json).

## Direct screen inspection and limits

The diagnostic and actual-model 320-pixel enlarged-text captures were inspected. The search field now fits with its clear control visible. Horizontal page overflow disappears at 390 and 320 pixels, and ancestor-clipping checks do not regress. [Actual enlarged-text capture](local-repair/revalidation/text-200-320.png).

Card descriptions still end in ellipses, metadata wraps awkwardly, the footer uses incorrect fee-related copy, and category content relies on horizontal scrolling. Search field labeling, intended font roles, reference composition and complete icon/catalog coverage remain unresolved. No overall visual pass follows from the 37 checks. These captures simulate computed-font enlargement in Chromium, not browser zoom or real-device accessibility.

A second local repair from the same unchanged original source also reached **37/37 on its first attempt**, confirmed by published-source revalidation. Its patch adds `min-width: 0` and spells out the existing flex basis. [Second response](repeated-repair/steps/attempt-1/repair-response.json), [second verification](repeated-repair/study.json). These two unseeded trials test repair repeatability on one existing source, not independent generation quality or general parity. A separate Learning service trial remains in progress and is not counted as complete.
