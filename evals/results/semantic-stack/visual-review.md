# Explicit mobile navigation stacking

Overall status: **INCOMPLETE**. This trial addresses an explicit mobile layout requirement beyond the former functional checks.

Learning's brief requests stacked mobile week navigation. Its earlier 39/39 source instead showed a horizontal carousel with partial neighboring course groups. The declared `mobileStack` contract checks all eight named lesson buttons at 390 and 320 pixels for existence, horizontal fit and sequential vertical placement. This adds two requirements: the unchanged source is **39/41**, not a regression against the former 39-check harness.

## Actual local model results

Two separate local repair runs from the same unchanged source each reached **41/41 on their first attempt**. Both add mobile CSS that makes the week groups vertical and full width. They preserve lesson content, search, completion, independent notes and enlargement checks. Published-source revalidation confirms both results. [First response](local-repair/steps/attempt-1/repair-response.json), [first verification](local-repair/study.json), [second response](repeated-repair/steps/attempt-1/repair-response.json), [second verification](repeated-repair/study.json).

The first patch uses a 390-pixel media condition; the second uses 768 pixels. Automated verification covers 1440/390/320, not every intermediate breakpoint. These are two repairs of one existing source, not independent full generation trials or a statistical reliability estimate.

## Direct rendered inspection

The first local 390-pixel output was inspected against the earlier horizontal version. All four week groups and all eight lesson buttons now appear in vertical order without requiring lateral navigation. Main content follows the complete list. [Fresh capture](local-repair/revalidation/390.png).

The list is tall, with large gaps, and the current lesson is pushed farther down. This does not establish the brief's compactness or week-button interaction requirement: week headings are still headings, not interactive week controls. Search labeling still wraps awkwardly; the empty-state description still refers to a left menu on mobile. Intended font roles, complete asset fidelity and full 75-rule/eight-guide review remain unresolved. The stacked-button check is deliberately scoped and does not approve these other requirements.
