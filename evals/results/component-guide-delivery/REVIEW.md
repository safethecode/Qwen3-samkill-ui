# Full guide delivery experiment

Status: **BELOW TARGET**. This is static, host-scaffolded component generation, not autonomous reference-level UI production.

The component generator now includes the complete applicable decomposition, typography, design guardrail, mobile and icon guides. Per-element guide paths and hashes are recorded in generation/inputs.json. Full catalog coverage remains unverified.

Both cases use qwen3.6:35b-a3b-coding with thinking disabled, 16K context and 2,048 output tokens per request. Fresh UI Bowl preview images and sanitized retrieval metadata are included. The reference previews do not reveal original CSS, DPR, exact font identity or unseen states.

## Direct review

| Case | Evidence inspected | Finding |
| --- | --- | --- |
| Trip | trip-1/render/390.png and browser report | Day 3 photo fragment is absent. Long title wrapping remains awkward. Text enlargement clips labels and metadata. 31/40 checks pass, which is a failure and does not measure visual parity. |
| Workshop | workshop-1/render/390.png and 320-text-200.png | Photo-led hierarchy is present, but the enlarged booking label is visibly cut off. Functional booking is not implemented in this static experiment. |

The workshop uses a licensed pottery photograph and local Noto Sans KR rather than claiming the reference's exact assets or typography. Existing source plans, shared CSS and semantic HTML were provided by the host; only component CSS was generated locally. No host repairs were applied to these outputs.

The evidence demonstrates guide delivery, not a successful quality improvement. Thinking-enabled generation is a separate experiment still in progress and is not rated here.

Validation: 99 unit tests and 42 browser checks passed for the guide delivery change. Those regression checks do not approve the generated screens.
