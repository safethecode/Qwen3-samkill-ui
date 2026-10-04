# Grid intrinsic minimum investigation

Overall status: **INCOMPLETE**. This investigation addresses Learning's page overflow at enlarged text, not full design compliance.

The retained Learning source starts at **38/39**. A host diagnostic copy changes only its narrow-screen grid column from `1fr` to `minmax(0, 1fr)`, allowing the content track to shrink below its intrinsic minimum. The copy reaches **39/39**. This is a counterfactual made by the host, not local-model output. [Source-bound comparison](diagnostic/study.json).

Direct inspection of the diagnostic 320-pixel enlarged-text capture shows the main heading and description wrapping inside the screen and the notes field fitting its column. Search-label wrapping and horizontal course navigation remain poor; the brief actually requests compact stacked week buttons. The initial description refers to a left menu even on mobile. Intended font roles and full catalog/guide approval remain absent. [Diagnostic capture](diagnostic/host-diagnostic/evidence/text-200-320.png).

The first actual local run with grid diagnostics but broad CSS excerpts exhausted four attempts without retained improvement. One patch did not match the supplied source and a hidden-overflow patch regressed clipping checks. The original source was restored. [Bound failed trial](broad-unit-failure/study.json).

## Actual local repairs

The runner then used complete CSS rule units with read-only media scope. This local run reached **39/39 in three attempts** by allowing the grid children to shrink and text to wrap. The first attempt had proposed the correct track correction but included indentation omitted from the supplied excerpt, so it was rejected. The source-unit builder now retains the original indentation. [First local result and fresh verification](local-repair/study.json), [actual events](local-repair/steps/events.json).

A new local run from the same unchanged 38/39 source, with indentation preserved, changed only the mobile `grid-template-columns: 1fr` to `minmax(0, 1fr)` and reached **39/39 on its first attempt**. The published source was independently re-evaluated with the same result. No hiding or content removal was added. [Repeated local response](repeated-repair/steps/attempt-1/repair-response.json), [fresh verification](repeated-repair/study.json).

These trials demonstrate targeted repair on one existing Learning source, not independent end-to-end generation parity. Direct inspection of the first local 320-pixel enlarged-text capture confirms the main content fits, but the horizontal navigation, awkward search label, mobile copy and missing intended font evidence remain. [Actual local capture](local-repair/revalidation/text-200-320.png). Full design and 75-rule/eight-guide approval is still incomplete.
