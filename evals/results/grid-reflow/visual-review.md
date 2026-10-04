# Grid intrinsic minimum investigation

Overall status: **INCOMPLETE**. This investigation addresses Learning's page overflow at enlarged text, not full design compliance.

The retained Learning source starts at **38/39**. A host diagnostic copy changes only its narrow-screen grid column from `1fr` to `minmax(0, 1fr)`, allowing the content track to shrink below its intrinsic minimum. The copy reaches **39/39**. This is a counterfactual made by the host, not local-model output. [Source-bound comparison](diagnostic/study.json).

Direct inspection of the diagnostic 320-pixel enlarged-text capture shows the main heading and description wrapping inside the screen and the notes field fitting its column. Search-label wrapping and horizontal course navigation remain poor; the brief actually requests compact stacked week buttons. The initial description refers to a left menu even on mobile. Intended font roles and full catalog/guide approval remain absent. [Diagnostic capture](diagnostic/host-diagnostic/evidence/text-200-320.png).

The repair feedback now exposes computed grid-item and track geometry. A separate local-model repair from the unchanged retained source is running; the host result above must not be attributed to it. Passing overflow checks will not establish the requested overall quality.
