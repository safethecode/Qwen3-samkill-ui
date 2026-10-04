# Service generation and text-stress recovery

Status: **INCOMPLETE**. Neither service demonstrates samkill-ui parity.

## Fresh independent service generation

Dispatch failed both shell attempts because its search input lacked a nonempty visible label. No completed source or design score is claimed. Learning completed at **22/27** under the generation harness; five checks fail on placeholder contrast, including two workflow end-state checks. [Original study and harness identity](generation/study.json).

Fresh evaluation of the same Learning source adds twelve text-stress checks and reports **33/39**. This is an expanded check set, not eleven improved requirements. The additional failure is horizontal overflow at 320 pixels with 200% computed-font enlargement: page scroll width is 386 pixels. [Current source and harness binding](revalidation.json), [stress geometry](learning-revalidation/text-stress-320.json).

Direct inspection of the normal 390-pixel screenshot shows a search label broken over two lines, a horizontal course list showing partial neighboring groups, a large empty band before lesson content, and a heading that renders with a visibly different style from the body. The initial description still says to use the left menu despite the mobile list being above it. Font-role intent is missing, so the observed typeface cannot establish intended fidelity. [Normal mobile capture](generation/learning/evidence/390.png).

The 320-pixel enlarged-text capture shows a truncated search placeholder, oversized horizontal navigation and content wider than the viewport. Notes and completion controls remain present, but that does not establish access to every course or responsive quality. [Enlarged-text capture](learning-revalidation/text-200-320.png).

## Repair integration

The service repair loop now includes stress checks and sends measured overflow geometry to bounded CSS repair. A regression fixture that passes ordinary checks but fails enlargement proves that a model repair is actually requested and a wrapping fix can be retained. Separate tests protect original text sizes after inspection, non-compounded font enlargement, existing functional progress and explicit unresolved layout review.

The real Round 02 candidate formerly reported 25/25 basic checks. Its initial expanded evaluation is **29/31**, failing enlargement at 390 and 320 pixels. Its first bounded local-model repair reached 31/31 by adding `overflow-x: hidden`. Direct inspection rejected this as masking: the search field and clear control extend beyond the clipping container. The masked source is retained only as a rejected experiment.

Geometric clipping candidates remain review obligations, not automatic failures or approvals. Computed-font enlargement is not browser zoom or a real-device accessibility certification. Full font-role, icon, 75-rule and eight-guide evidence remains incomplete.

## Masking rejection

The updated evaluator also measures direct text/control bounds cut by hidden or clipped ancestors. Under this same expanded harness, the original source and masked candidate both score **35/37**. The original has enlargement overflow; the candidate replaces that with **four clipped elements at 390 pixels and four at 320 pixels**. Protected measurement comparison therefore rejects this candidate even though page overflow disappears. [Bound comparison](masking-attempt/comparison.json), [original source](masking-attempt/before/source), [rejected source](masking-attempt/masked/source).

The raw earlier repair log still records its historical acceptance under the incomplete overflow-only check set; it is preserved rather than rewritten. That acceptance is superseded by this rejection. A new bounded local run begins from the original source under the stronger checks. This is a diagnosed false pass and repair-loop correction, not a generated design quality improvement.