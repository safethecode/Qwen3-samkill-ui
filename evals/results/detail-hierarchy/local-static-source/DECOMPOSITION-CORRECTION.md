# Detail hierarchy correction

Observed in the inspected UI Bowl Frip detail: photo-led navigation with a back arrow, white semantic sections separated by gray canvas gaps, and a quiet bounded secondary action beside the primary booking action. The screenshot does not expose original CSS, exact font, or a booking success state.

The previous host assembly invented a brand header, omitted the return route, used a thin host divider and a transparent favorite control. The host-supplied dialog repeated product information above a same-level completion heading. Those are decomposition/assembly defects, not just local CSS failures.

Chosen adaptation: photo overlay return link to an actual class listing; white identity, host and action surfaces on a gray canvas with 12px gaps; favorite on a quiet gray control surface. Completion becomes the dialog title, with product and schedule inside a secondary summary. The form product block is hidden in success. The booking modal is user-directed design, not an observed Frip modal.

Ownership: shell owns navigation and section surfaces; identity owns product facts; host owns provider information; actions own favorite and booking; dialog owns state heading and summary; app.js switches visibility and preserves storage behavior. No invented ratings, user counts or host photographs.

This revision is host-authored, based on the prior local-generated CSS and behavior. It is not an independent local generation result and is not evidence of general quality parity. Existing component-plan.json records the prior generation input only; it must not be reused as the corrected plan. Current machine-readable relationships are in layout-contract.json. Samples repeat the corrected full assembly, not isolated components, and prove only matching assembled widths.
