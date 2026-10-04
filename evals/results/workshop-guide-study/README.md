# Workshop regeneration with delivered decomposition guidance

Status: **INCOMPLETE — visual quality remains below the reference target**. The final assisted artifact passes 40/40 current functional/rendering checks. This is not commercial-quality approval, full catalog compliance, or evidence of repeatable unattended generation.

The local decomposition guide was delivered as actual source-bound text to all six generation stages. A fresh authenticated UI Bowl search retrieved the Frip booking preview at 2026-10-04 10:32:29 UTC: [provenance](generation/source/assets/reference/live-retrieval.json), [inspected native preview](generation/source/assets/reference/booking-preview.jpg). The reference supports selected-class summary before booking options; its media, exact typography and visual execution are not reproduced by this independent product. Credentials and signed URLs are excluded.

## What the fresh run established

Unassisted generation still scored [28/40](generation/revalidation/report.json), the same count as the previous run. The layout stage initially truncated and retried. Adding the guide to the request therefore did not establish reliable generation quality. The new source skipped the detail-to-form transition, created duration/capacity nodes without appending them, hid the search label and used low-contrast text. Its abstract illustrations were repeated rather than class-specific.

All subsequent repairs were local Qwen3.6 35B A3B calls with host-selected defects and bounded scopes. Host assistance includes the brief, prepared fonts/icons, diagnosis, repair selection and visual review. These are not zero-intervention results.

| Snapshot | Checks | Observed result |
| --- | --- | --- |
| [Flow](flow/revalidation/report.json) | 28/40 | Real detail-to-form transition added; contrast failures remained. |
| [Contrast](contrast/revalidation/report.json) | 33/40 | Default-state text became readable. Hover transition still failed later. |
| [Metadata](metadata/revalidation/report.json) | 33/40 | Duration/capacity now appear with official Clock/Users assets. |
| [HTML label](label/revalidation/report.json) | 33/40 | Removing the hidden class alone did not work: CSS also hid the label. |
| [Visible label](label-visible/revalidation/report.json) | 36/40 | CSS hiding removed. |
| [First state-color repair](contrast-states/revalidation/report.json) | 36/40 | Rejected as incomplete: background transition remained, causing low contrast. |
| [Introductory copy](intro/revalidation/report.json) | 39/40 | Repeated hero copy replaced with a distinct Korean product description. |
| [Stable hover colors](hover-stable/revalidation/report.json) | 40/40, old gate | Foreground/background now switch together. This score missed a confirmation defect. |
| [Stronger confirmation audit](confirmation-before/revalidation/report.json) | 39/40 | The same artifact omitted its selected class from confirmation. |
| [Confirmation repair](confirmation/revalidation/report.json) | 40/40, stronger gate | Existing class heading now appended and survives reload. |
| [Single current action](action/revalidation/report.json) | 40/40, stronger gate | Completed 예약하기 transition control hidden once the actual form opens. |

## Corrected gate blind spot

The old booking persistence check asserted the guest name only. It did not prove that the selected class, date and time were present. `renderConfirmation` created a class heading without appending it, so the old check passed incomplete output.

The gate now requires a visible confirmation containing the selected class, guest, date and chosen time, both immediately and after reload, followed by cancellation and reload verification. Regression fixtures reject guest-only summaries and missing class/date/time independently. The complete fixture passes. All **139 repository tests** passed after this change. Old reports remain unchanged; the stronger audit has its own source/harness binding.

## Direct visual review

[Latest mobile](action/revalidation/390-full.png) · [Latest desktop](action/revalidation/1440-full.png) · [Booking form](action/state-review/booking-390.png) · [Confirmation after reload](action/state-review/confirmation-reload-390.png).

The host inspected these rendered screens. Improvements are visible metadata, readable default/interactive text, a visible search label, distinct introductory copy, complete persisted booking details and removal of the redundant form-opening action. A second state-capture evaluation also returned 40/40 for the same final source; it is not a second independent generation run.

Remaining visual deficiencies include oversized abstract hero art, repeated generic card ellipses, excessive page length, broad category bands and a booking summary without reference-quality media. The original reference's professional visual execution has not been matched. Missing layout-contract and complete 75-rule/eight-guide evidence remains unverified. This study does not grant parity even though its current functional checks pass.

## Evidence

The generation and final action snapshots contain complete source/assets. Intermediate `repair/before.json` files retain exact source text; request/result records retain source and harness hashes. Combine an intermediate source record with the unchanged generation assets/contracts when reconstructing it. Raw model responses, unsuccessful repairs and screenshots are preserved. `.gitattributes` disables line-ending conversion in this evidence subtree.
