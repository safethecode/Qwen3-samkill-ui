# Service-specific implementation contracts

Before generating a new service, identify its user, primary task and one complete state transition. Specify the initial, empty, invalid, saved and recovered state. A static translation exercise must not imply that disabled sample controls are real product functionality.

For reference-driven work, follow [Decomposed layout](decomposed-layout.md) before implementation. Break the dominant component into owned semantic regions, declare layout relationships, and compare element samples with the assembled screen. File-by-file generation alone is not decomposition.

Choose the dominant structure from the task, not from the last generated application:

| Task | Dominant content | Relationships to preserve |
| --- | --- | --- |
| Operations queue | Comparable rows and selected record detail | Column alignment, urgency versus action, exact selected identity |
| Booking | Item media, availability and confirmation | Media belongs to its item; selected item/date/time survive confirmation |
| Learning | Lesson prose and course navigation | Current lesson is dominant; progress derives from completed lesson IDs |
| Cooking | Food and current instruction | Dish identification, ingredients and a single active cooking step |
| Invitation | People, event and response | Editorial rhythm, readable event details and quiet response controls |
| Document collection | Actual document previews | Paper/content hierarchy and compact document management |

Freeze visible labels and element interfaces before generating behavior. Verify IDs and element types in the HTML before generating dependent JavaScript. Invalid markup should be corrected at this boundary rather than propagating guessed selectors into later files.

For a repair, select one observed defect, one relevant file and one bounded source region. Preserve enough read-only HTML structure to understand IDs and classes. Apply exact patches and parse the entire resulting file. If the edit needs coordinated changes outside the current region, keep that dependency explicit and do not claim the workflow is fixed until all involved behavior has been tested. A stalled patch must not trigger an unbounded full-file response.

Compare screenshots at equal viewport widths. Inspect the dominant component, content density, spacing, hierarchy, mobile adaptation and primary action. Missing photographic or branded assets limit fidelity even when placeholders satisfy geometry. Do not describe new service designs as copies of an unrelated reference or award aesthetic equivalence based on passing browser checks.

Distinguish model load, image encoding, prompt processing and output generation when diagnosing timeouts. Smaller output helps only the last stage. Retain raw failures and validated completed stages; never erase a failed attempt when a later one works.
