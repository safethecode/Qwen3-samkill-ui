# Travel itinerary: bounded photo repair

Status: INCOMPLETE_REFERENCE_QUALITY.

The host identified the invisible full photos and misplaced partial Day3 crop from actual renders. The common component repair runner sent only E3 and those defects to the local model. In 54.4 seconds it removed the destructive clip path, kept the photo corner treatment and positioned the supplied partial crop within the observed fragment. The host applied the same CSS to the shared stylesheet; sample and assembly continue to use identical component HTML.

The original suite improved from 34/40 to 40/40. Under the subsequently expanded media-visibility gate, the unmodified failed candidate is 31/40 and this repaired candidate is 40/40. Both audits are retained with their respective source/harness bindings; these are different harness versions, not evidence of repeated independent generation.

Direct inspection of [390px](revalidation/390.png) and [320px](revalidation/320.png) confirms visible photographs, outside-card checkboxes, compact day controls and a separate completion area. At 320px the long second entry grows disproportionately tall with empty space beneath its fixed-size image. Type and image proportions still differ from the reference. Fixed HTML and detailed host guidance remain substantial assistance. Interaction behavior is intentionally disabled; full catalog/guide evidence and repeated representative quality are unfinished.

The media gate measures loaded image boxes and rectangular overflow/inset clipping. It does not certify arbitrary clip shapes, occlusion, SVG paint or perceptual fidelity. Unknown geometry remains UNVERIFIED. [Bounded repair experiment](../../experiments/repair-trip-photos.mjs).
