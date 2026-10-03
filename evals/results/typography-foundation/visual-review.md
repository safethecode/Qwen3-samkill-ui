# Typography foundation: incomplete

These are host-assisted local generation experiments, not evidence that the model learned the full skill. The basic browser checks do not approve composition, intended font roles, all icons or the 75-rule catalog.

## Controlled source-copy comparison

The original model outputs were copied unchanged before applying the supported CSS typography normalization. Both source versions and their hashes are retained in [the comparison](comparison/study.json).

| Case | Before | After host normalization |
| --- | --- | --- |
| Round 01 | 19/25 | 22/25 |
| Round 02 | 19/25 | 22/25 |
| Round 03 | 22/25 | 25/25 |

The recorded basic progress decisions cover only that check set. None is final quality acceptance. The latest fresh generation repetitions produced Round 01 at 19/25 and Round 03 at 22/25 before normalization; these are separate unseeded samples, not a controlled model ranking. [Generation records](generation-repeats/study.json).

## Direct rendered inspection

The normalized 320-pixel, 200% text captures for all three rounds were inspected, together with the original Round 03 capture. Round 01 still ellipsizes a long place name. Round 02 overflows the search clear control, clips category content and card descriptions, and wraps footer content awkwardly. Round 03 collapses promotion text beside its reward button into a narrow column; bottom navigation overlays content and timeline labels overlap. Severe Round 03 layout defects were already present before normalization.

Round 02 page scroll width worsened after normalization under 200% text: **395 to 415 pixels at a 390-pixel viewport**, and **389 to 409 at a 320-pixel viewport**. Larger readable text is not sufficient without layout repair. See the [original stress evidence](comparison/round-02/before-text-stress/stress.json) and [normalized stress evidence](comparison/round-02/text-stress/stress.json). Round 01 and Round 03 page widths did not increase, which does not establish absence of clipping or overlap.

These stress captures use Chromium computed-font enlargement and a separate text-spacing override. They are not real-device browser zoom, Safari or IME verification. Geometry candidate counts are inspection aids, not automatic defect verdicts.

## Bounded local contrast repair

Two local model repair attempts improved normalized Round 02 from 22/25 to **25/25**. The published source was independently re-evaluated with the same result. [Fresh source-bound verification](contrast-repair/revalidation.json), [repair attempts](contrast-repair/steps/result.json).

The normal 390-pixel capture has more readable labels and darker metadata. However, the footer still contains incorrect fee-related content, visible search labeling remains unresolved, and intended font roles are unproven. Fresh [post-repair stress evidence](contrast-repair/text-stress/stress.json) still exposes layout problems. Contrast repair did not establish responsive or visual parity.

## Remaining work

Overall decision: **INCOMPLETE_REQUIRES_LAYOUT_REPAIR**. Route text enlargement and spacing failures into bounded repair, preserve every passing functional check, verify intended font roles and official asset coverage, and complete current source-bound catalog/guide review. Repeated representative generation must demonstrate quality before claiming parity.
