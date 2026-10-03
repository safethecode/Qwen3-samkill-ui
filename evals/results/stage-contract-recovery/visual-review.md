# Stage-contract recovery

Status: **INCOMPLETE**. The previously failing reference-document probe now completes HTML, JavaScript and CSS. This is one unseeded run, not a reliability estimate.

JavaScript completed on its first attempt instead of returning HTML. The initial layout response completed with 2,017 tokens within the new 2,048-token allowance, without a layout retry. The raw responses retain the actual timing and token counts. Different runs are not isolated latency measurements.

Fresh evaluation of the published source returns **19/25**. The six failures are readable typography and rendered-font/contrast checks at all three viewports. The previous completed Round 02 candidate also had 19/25, so there is no aggregate check-count improvement.

The 390- and 320-pixel screenshots were inspected directly and compared with the earlier candidate and the upstream assembled reference. The new candidate has a more compact header, avatars grouped with names and metadata, descriptions spanning the card, and quieter footer actions. However, metadata uses 10–11px text, roles use 13px, and footer text uses 12px despite the 14px minimum. The source still adds separators and misuses footer copy such as `전문분야 45회 / 노하우 12회` instead of the contract's fee information. The search has no persistent visible label in these captures. These are remaining failures, not exceptions approved for fidelity.

Chromium reports Noto Sans KR, Segoe UI, Malgun Gothic and Arial in the 390-pixel font inventory. Role-specific intended fonts, fallback behavior and full font fidelity are still unverified. Source-bound captures and font inventories are retained; no full 75-rule/eight-guide approval was produced.

The observation that some spatial relationships are closer does not establish higher overall design quality: legibility and semantic content remain inadequate. Repeated Round 01/03 generation under this runner is a separate ongoing experiment.
