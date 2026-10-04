# Workshop thinking comparison

Status: **BELOW REFERENCE TARGET**. Static host-scaffolded CSS, without implemented booking workflow or full rule-catalog approval.

The same source inputs used in the prior thinking-off workshop experiment were used here. The model is qwen3.6:35b-a3b-coding with16K context. Thinking-on also raised the output cap from2,048 to8,192, so this is a practical configuration comparison, not an isolated thinking toggle.

Thinking-off took310,335 ms across three calls; thinking-on took1,114,946 ms, approximately3.59 times as long. All three thinking-on components completed on their first attempts. This single run provides no evidence of reliable reference-level quality.

Direct inspection of390px and320px with200% text found two concrete defects: rounded mobile photo corners despite an explicit edge-to-edge rule, and a clipped booking label caused by fixed52px button height. Thinking did not solve the prior enlarged-action defect.

Two bounded local repairs, with thinking disabled, changed only media corner treatment and booking button sizing/wrapping. The repaired320px enlarged capture was inspected: the complete action label is visible, and photo corners are square. The repaired action still wraps awkwardly and the page remains excessively tall at enlargement. No visual-parity claim.

The new controlTextOverflow diagnostic compares visible button label range boxes against the control itself. The old ancestor-clipping check alone missed this case because the button had overflow:visible. Fresh reports retain both diagnostics. A passing diagnostic does not establish typographic polish or reference fidelity.

Reference inspection uses a fresh UI Bowl Frip preview. The implementation uses a separately licensed pottery photograph, local Noto Sans KR and official supplied icons; it does not claim exact reference font, asset or original CSS identity. The reference and provenance are preserved.

Remaining: repeatable autonomous generation, polished enlarged layout, actual interactive completion, independent services and full75-rule/eight-guide evidence. Model comparison with qwen3-coder:30b is separate and not rated here.
