# Cross-service evaluation and bounded work

## Design

The user requires comparisons beyond the resume list, fresh service briefs, and smaller repair tasks when deadlines expire. Evaluate every available upstream round (01, 02, 03, 04, 08, 09, 10); record 05–07 as unavailable. Static translation rounds and functional product rounds are different scopes and must not share a misleading aggregate success rate.

Plan three held-out products before generating source: a maintenance dispatch desk, a shared workshop booking service, and a self-directed learning planner. Each requires a different information architecture, a complete main workflow, empty/error states, persistent state and responsive behavior. Local model output, raw failures, screenshots and timings are evidence. Host-written product implementations must never be labeled model output.

Timeouts must retain stage and elapsed-time evidence. Split generation by file and repairs into bounded source units, preserve atomic syntax validation and whole-app regression checks, and never treat a timeout as a visual verdict. Image encoding time is separate from output generation time. A small image probe must succeed before a full visual comparison; otherwise report the vision environment as unavailable.

## Implementation plan

Use executing-plans inline with one final fresh review. No code comments, no public personal paths, no new dependencies, granular commits and push as already requested.

- [ ] Add a generic service generation profile and behavioral tests preventing resume-specific instructions from leaking into it.
- [ ] Add bounded repair context/requests with timing evidence, test oversized source and atomic rejection.
- [ ] Add frozen service briefs and a replayable benchmark with real browser workflows and screenshot capture.
- [ ] Run local generations and inspect all available original rounds at equal viewport sizes; keep failures visible.
- [ ] Publish comparison findings, source/evidence provenance and limitations. Run regression tests, obtain review, commit by concern and push.

## Review focus

Do not infer aesthetic quality from functional counts. Do not compare different viewport sizes as pixel fidelity. Do not give static rounds credit for unimplemented interactions. Do not hide timeouts or truncate source without telling the model. Do not overwrite existing user files or retry unboundedly. External GPU load must be recorded without terminating user applications.
