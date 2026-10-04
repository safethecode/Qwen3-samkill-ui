# Intrinsic flex constraint recovery

Overall status: **INCOMPLETE**. This repairs a specific enlarged-text defect, not the full design or catalog.

## Diagnosis and measured repair

The unchanged Round 02 source scores **35/37**. At 200% text, its search input retains a computed `min-width: auto` and is 343 pixels wide. At the 390-pixel viewport, its flex parent is 358 pixels wide but has 399 pixels of scrollable content. Previous model attempts repeatedly changed outer containers or hid overflow instead of correcting this input constraint.

A controlled host counterfactual added only `#search { min-width: 0; }` on a source copy and reached **37/37**. This is explicitly a diagnosis experiment, not local-model output. [Before/after source bindings and measurements](diagnostic/study.json).

The repair runner now places the computed flex item's ID, minimum width, shrink factor and parent geometry at the beginning of the failure feedback. The local Qwen model then independently produced a one-line `min-width: 0` addition inside the existing search rule on its **first repair attempt**, improving **35/37 to 37/37** without hidden overflow or content removal. Fresh evaluation of the published source confirms the result. [Actual response](local-repair/steps/attempt-1/repair-response.json), [fresh verification](local-repair/study.json).

## Direct screen inspection and limits

The diagnostic and actual-model 320-pixel enlarged-text captures were inspected. The search field now fits with its clear control visible. Horizontal page overflow disappears at 390 and 320 pixels, and ancestor-clipping checks do not regress. [Actual enlarged-text capture](local-repair/revalidation/text-200-320.png).

Card descriptions still end in ellipses, metadata wraps awkwardly, the footer uses incorrect fee-related copy, and category content relies on horizontal scrolling. Search field labeling, intended font roles, reference composition and complete icon/catalog coverage remain unresolved. No overall visual pass follows from the 37 checks. These captures simulate computed-font enlargement in Chromium, not browser zoom or real-device accessibility.

A second local repair from the same unchanged original source also reached **37/37 on its first attempt**, confirmed by published-source revalidation. Its patch adds `min-width: 0` and spells out the existing flex basis. [Second response](repeated-repair/steps/attempt-1/repair-response.json), [second verification](repeated-repair/study.json). These two unseeded trials test repair repeatability on one existing source, not independent generation quality or general parity.

## Independent Learning service

The Learning source improved from **33/39 to 38/39** after a local placeholder-color repair. The same contrast defect had failed three viewport checks and two workflow end-state checks, so five passing checks represent one repaired cause, not five independent improvements. Its retained source only adds explicit placeholder color and opacity. Fresh published-source revalidation confirms 38/39. [Repair events](learning-repair/steps/events.json), [fresh verification](learning-repair/study.json).

Three subsequent bounded layout attempts made no measured improvement and were rolled back, retaining the contrast repair. At 320 pixels with enlarged text the page still overflows; the mobile navigation also remains horizontal despite the brief asking for compact stacked week buttons. Direct inspection of the fresh normal 390-pixel capture shows the original broken search-label wrapping and partial course groups remain. The intended font-role contract and all catalog/guide reviews are still incomplete. [Fresh mobile capture](learning-repair/revalidation/390.png).
