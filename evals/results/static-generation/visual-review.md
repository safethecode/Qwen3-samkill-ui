# Static generation inspection

Status: **INCOMPLETE**. These are scoped observations, not a completed 75-rule/eight-guide review.

The available upstream Round 02 assembled reference was inspected directly alongside the newly rendered 390-pixel candidates. The benchmark adapts the names, content and complete-card requirements, so these observations concern layout relationships rather than identical copy or pixel parity.

| Trial | Observed outcome |
| --- | --- |
| Baseline | Generation stopped while inventing a mentor-registration form absent from the static contract. No finished screenshot or visual score exists. |
| Static scope only | The HTML/CSS finished, but the model never invoked its renderer. The screenshot has a heading, search, chips and footer, with no mentor cards. Browser result: 16/25. |
| Explicit static lifecycle | Both mentor cards and supplied avatar images render. The separate favorite controls are visible and disabled. Browser result: 19/25, reconfirmed from the published source. |

The retained lifecycle candidate is still below the reference quality. Its card metadata occupies a separate row rather than the compact avatar/name/metadata grouping. Footer separators and broad disabled actions replace the quieter aligned footer relationship. The heading is oversized relative to the reference; several labels and badges use 12–13px text despite the 14px contract. Blue metadata and the bottom disclosure have measured contrast failures. The disclosure incorrectly describes browser storage even though this static flow does not save data.

Actual Chromium font inventory at 390 pixels contains Malgun Gothic and Arial. Declaring Pretendard in CSS did not establish that Pretendard was loaded. A role-specific font contract is still missing, so font fidelity remains unverified. The generated source uses supplied avatar and heart files; provenance and reference completeness still require review. A passing icon check is not approval of all reference assets.

The static lifecycle is host-authored orchestration: the model defines `renderStaticView()`, and the runner calls it and disables example buttons. The evidence identifies those two host stages explicitly. This is an execution improvement, not evidence that the local model independently learned reliable startup or original-quality design.

Each version has only one unseeded sample. No repeated reliability rate, controlled latency improvement or general design parity is inferred from these runs.
