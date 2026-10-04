# Narrow travel row repair study

Status: INCOMPLETE_REFERENCE_QUALITY.

A fresh authenticated UI Bowl lookup returned the representative itinerary preview, which was inspected before this comparison round. The sanitized retrieval record and image are included in each source's assets/reference/responsive-live files. Original CSS, fonts and hidden content remain unknown. The new 72px photo size and 8px copy padding at widths up to 360px are chosen responsive adaptations, not recovered reference values. All rows retain the same photo size at a given width and a minimum 14px text size.

| Stage | Browser result | Additional finding |
| --- | --- | --- |
| Original photo-repaired source | 40/40 | Long row at 320px measured 156px high |
| Initial responsive repair | 39/40 | 200% text clipped at 320px |
| Line-height repair | 40/40 | Rejected in review: changed base line heights outside the requested narrow scope |
| Scope repair | Not applied | Overlapping exact patches rejected before source writes |
| Final scoped retry | 40/40 | Narrow-only adjustment; wider screenshots unchanged |

The initial repair prompt estimated the long row at about 196px. That estimate was wrong: subsequent browser measurements established 156px. Preserve the raw prompt as history; use the measured geometry as evidence.

The final 320px long row is 131px high, a 25px reduction. Its copy box grows from 119px to 143px including padding, and all three photos use 72px squares with vertical centering. The shorter rows are 96px high. The candidate retains all text and passes the existing enlargement, spacing, font, image-visibility and layout checks. The before/after 390px and 1440px screenshot SHA-256 hashes are identical; see comparison/wide-preservation.json and the source-bound reports.

Direct inspection of the final 320px render confirms less empty space and a more balanced narrow row. This remains an assisted static translation, with host-selected defects and supplied HTML/assets. It does not demonstrate independent visual defect selection, functional itinerary editing, complete catalog approval or equal commercial quality across services. Exact reference proportions and font identity are not established. Representative repeated runs and independently planned interactive services remain required.

All failed attempts are retained. The overlapping-patch stage has request/response evidence and a hash-verified unchanged source reference to the lineheight stage, rather than a fabricated successful output. No requirements or failure findings were relaxed to obtain the final browser result.
