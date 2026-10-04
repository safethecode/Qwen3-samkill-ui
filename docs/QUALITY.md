# Unattended local quality workflow

Run the quality command to require both functional and visual review. The older `iterate.mjs` and `benchmark.mjs` commands measure functional fixture completion; their zero exit status is not design approval. Ordinary OpenCode chat is not automatically intercepted by this runner.

## Prepare once

Install repository dependencies with `npm ci` and Playwright Chromium with `npx playwright install chromium`, or set `CHROME_PATH` to an installed Chrome executable. Start Ollama and install `qwen3-coder:30b` and `qwen3.5:9b`.

The target needs `DESIGN.md`. It may contain an existing `index.html`, `styles.css` and `app.js`, or start without application source. Optional `REFERENCE.md` supplies observations to generation/repair. Copy `profiles/quality.example.json` into the target as `QUALITY.json`, add your approved desktop/mobile PNG references at the relative paths it names, and adapt the observations. Both reference images are required. Do not use a candidate's own output as its acceptance reference.

The included functional evaluator is for the Korean resume fixture. Other applications require an adapted evaluator and design contract; this command does not certify arbitrary websites.

Project setup registers the Node executable and runner script in `.opencode/quality-runner.json`. The installed skill instructs the local agent to invoke it when QUALITY.json exists. This is an agent instruction, not an OpenCode plugin that intercepts every completion; use the quality command directly when enforcing the gate is essential. Keep the repository checkout and its dependencies available, or update that local registration after moving them. Do not commit machine-specific registration files.

## Run

From this repository:

```sh
npm run quality -- runs/my-ui 4
```

The number is the maximum visual repair attempts, from 0 to 10. Zero disables visual repairs; the separate functional stage may still generate or repair within QWEN_FUNCTIONAL_ROUNDS before visual inspection and confirmation. An optional fourth CLI argument selects a manifest outside the target: `node scripts/quality.mjs TARGET 4 PATH_TO_QUALITY_JSON`.

Default models are Coder 30B for generation and Qwen3.5 9B for repairs and vision review. They run sequentially against local Ollama. Each viewport review is divided into three requests of two criteria, with a 1,536-token output budget per request. All chunks must validate; partial reviews cannot pass. The reviewer sees only reference/current images, the contract and observations, and receives no generation conversation or previous scores. Sharing model weights still creates correlated judgment errors; separate requests are not independent human reviewers. Splitting output does not eliminate image-encoding cost.

```powershell
$env:QWEN_GENERATE_MODEL = 'qwen-ui'
$env:QWEN_REPAIR_MODEL = 'qwen3.5:9b'
$env:QWEN_REVIEW_MODEL = 'qwen3.5:9b'
$env:QWEN_FUNCTIONAL_ROUNDS = '3'
npm run quality -- runs/my-ui 4
```

`qwen-ui` is the optional portable alias from the README. `OLLAMA_URL` changes the endpoint. Generation/repair thinking default to false and can use their existing environment overrides; review thinking is disabled to bound the response. A reviewer must advertise vision support. No cloud fallback is used.

## Gates and recovery

For a supported service case, set `serviceCase` in `QUALITY.json` to its ID from `evals/service-cases.mjs`; otherwise the legacy resume evaluator is used. The service evaluator checks font weight, form/placeholder typography, actual Chromium fonts, solid-background contrast, verified icon geometry/paint and assets at 1440/390/320 pixels and workflow end states. Complex surfaces, unverified icon systems and missing intended typography remain explicit review findings. They are not proof of failure or permission to claim completion.

Declare intended font roles in `design/typography.json`, for example `{"roles":[{"selector":"h1,p,label,button","families":["Malgun Gothic"]}]}` for a contract explicitly using that system font. Use the actual project's font choices and supported fallbacks; this example is not a cross-platform font recommendation. Local styles, scripts, fonts and media outside `assets/` also participate in the completion binding. Evaluators refuse to serve unbound dependencies. The default resume evaluator checks fonts and icons at 1440/390/320 pixels in initial and editor states too.

For staged service generation, create this file before starting generation, alongside `DESIGN.md` and `REFERENCE.md`. The generator supplies the unchanged intent to every model stage and binds it to the generation checkpoint; changing it invalidates resume. Each role must have a nonempty selector and nonempty rendered-family names, and the file must fit within 12,000 characters. The generator does not install fonts or infer intended families from its own output. Provision the intended font assets or explicitly choose installed system fonts first. Missing intent remains unverified; a successful prompt or a declared CSS family does not prove that the browser rendered the intended font.

Each automated `reviewRequired` finding has its own `id`, evidence path, category and applicable rule IDs. After actually resolving it, the matching catalog result must include that exact ID in `resolved_findings` and cite the current evidence file. Approval of an icon finding cannot resolve a font or contrast finding in the same file. A changed finding requires a new inspection; filename-level acknowledgement is insufficient.

Run `node scripts/catalog.mjs TARGET init` to create conservative unknown drafts covering 75 catalog rules and eight guides. Determine each rule's actual scope and applicability, retain original check kinds and add project-specific requirements. Inspect the implementation and evidence before filling findings. `node scripts/catalog.mjs TARGET fingerprint` invokes the bundled Python gate; set `QWEN_PYTHON` to a working Python 3 executable if needed. Copy its current hashes into the report only after conducting the review. Then run `node scripts/catalog.mjs TARGET check`. The gate checks evidence integrity and coverage, not the truth of a reviewer's aesthetic judgment. The drafts do not automatically review themselves, and automatic full-catalog completion has not been demonstrated.

1. Validate the manifest, both images and vision capability before generating or repairing.
2. Complete the existing functional loop and independently rerun its browser checks, including design geometry. Capture fresh desktop/mobile images.
3. Review composition, hierarchy, spacing, typography, document content and action priority at both widths. Every criterion needs evidence, score at least 4/5 and confidence at least 0.8; all reported issues must be resolved. Confidence is self-reported, not a calibrated probability.
4. Feed one localized defect to the repair model. Select a ranked source excerpt of at most 6,000 characters and request one patch, with at most 2,000 matching and 4,000 replacement characters. Read-only HTML structure supplies bounded cross-file context. Stalled attempts rotate through excerpts instead of expanding to full-file output. Each request has a 2,048-token output budget and a 120-second deadline. Timeout consumes a repair attempt; retries remain bounded. Validate the entire resulting file and preserve all passing functional checks. Parsed comments are removed deterministically before evaluation.
5. Reject and restore candidates that regress any protected visual criterion, introduce functional failures or make no measured progress. Keep rejected evidence locally. Do not relax thresholds when the model struggles.
6. A separate adversarial audit must pass both viewports using the same source and screenshot hashes. Source, contract or reference changes invalidate completion.
7. Require the upstream Python catalog gate, complete source/asset scope, role-specific typography and eight-guide coverage. A visual pass cannot bypass missing, stale or unknown catalog evidence.

`QUALITY-RESULT.json` and `UI-STATUS.md` record RUNNING, COMPLETE or INCOMPLETE. COMPLETE means the declared automated gates passed; it does not guarantee samkill-ui parity on every task. Errors, truncated or malformed review, unavailable vision and exhausted rounds return a nonzero status. Never interpret attempted repair as completion.

Each `quality-*` directory retains functional logs, screenshots, review responses without private reasoning, reference/source bindings, repair requests and decisions. Raw source snapshots may contain project data; review them before sharing. A target lock prevents simultaneous quality runs. An interrupted process can leave `.quality-lock`; verify no process still uses that target before removing it.

Visual judgments can be wrong or inconsistent. Strict rollback can reject a useful edit when the judge's scores fluctuate. Reference selection and representative positive/negative calibration remain necessary; adding gates improves rejection discipline without guaranteeing every task converges.

## Auditable generation typography

Service generation benchmarks, service revalidation, bounded service repair and the service quality route now request text-stress evaluation at 1440/390/320 pixels. Twelve additional checks measure horizontal page overflow and text/control clipping by hidden-overflow ancestors under 200% computed-font enlargement and a separate text-spacing override. The repair model receives overflowing element geometry and a bounded CSS task even when the ordinary checks all pass. Every previously passing check and non-worsening measurement remains protected. Direct `evaluateService()` callers enable this with `{ textStress: true }`; reference capture is unchanged.

Stress screenshots and geometry are retained. Clipping and overlap candidates remain explicit layout review findings; zero horizontal overflow does not approve them. This Chromium simulation does not replace real-device zoom, workflow-state enlargement or a full accessibility review. The functional repair runner may still return `FUNCTIONAL_PASS` with unresolved visual findings, which the overall quality route must not treat as completion.

Rejected repairs feed failing check names, worsened measurements and diagnostics into the next bounded attempt. Provisional edits without measurable progress receive explicit feedback too. Every attempt saves `next-repair-feedback.txt`; this improves correction context without accepting regressions or raising the attempt budget.

Stress diagnostics also record flexible items whose computed automatic minimum width may prevent shrinking inside an overflowing row. Their actual widths, shrink factors and parent geometry lead the repair feedback, before the larger geometry dump can be truncated. This is a measured hypothesis for the model to investigate, not an automatic CSS replacement or a guarantee that every overflow has this cause.

For overflowing grids, the diagnostics include grid-item minimum widths and the actual resolved column sizes. The model can inspect automatic track minimums and choose a local reflow correction rather than hide overflow. A grid hypothesis is not a design approval: correct navigation orientation, font roles, clipping and reference fidelity still need separate verification.

When stress feedback identifies automatic grid minimums, CSS repair uses complete parsed rules instead of large arbitrary text windows. Selector relevance and simple pixel min/max-width conditions prioritize the applicable narrow-screen rule; surrounding media scope remains read-only context. Original indentation is retained for exact patch matching. Other repair categories keep their existing unit selection. Browser validation still decides whether a change improves the target without regressions.

Service cases can declare `mobileStack`, an ordered list of required button names from their brief. At 390 and 320 pixels the evaluator checks that every named button exists uniquely, fits horizontally and follows the previous button vertically. Learning declares its eight lesson buttons because its brief requires stacked mobile navigation. These explicit layout failures enter bounded CSS repair even when ordinary checks pass, using individual rules and mobile media context. This verifies direction and ordering only; compactness, week-heading controls, typography and overall design fidelity remain separate review obligations.

The service benchmark opts into `generateService()` with `normalizeContractTypography: true` because its contracts explicitly require at least 14px text and weight 500. Direct API callers retain unchanged output by default. This supported CSS normalization records before/after hashes and `APPLIED_NOT_APPROVED` in `typography-normalization.json`; original model responses remain available. Shared tokens used for spacing are preserved instead of enlarging padding when correcting font size.

This is a generation foundation, not a quality approval or interception of arbitrary OpenCode chats. Unsupported CSS, intended font families and roles, responsive geometry, enlarged-text layouts and the full catalog still require verification and repair. The recorded Round 02 enlarged-text overflow worsened after normalization despite improved basic readability checks. See the [source-bound experiment](../evals/results/typography-foundation/visual-review.md).

## Inference resource settings

`QWEN_NUM_GPU`, `QWEN_NUM_CTX` and `QWEN_NUM_BATCH` explicitly override Ollama request options across generation, repair and review. They are optional; choose them for the local machine rather than assuming full GPU offload fits alongside other applications. For example, `16`, `16384` and `128` reserve more headroom by offloading fewer layers. This can slow token generation while avoiding resource contention. A timeout can occur during model load, image encoding, prompt processing or output generation; it is not evidence of poor UI quality. Responses retain load, prompt and generation timings. Bounded repair requests also record excerpt location, input length, output budget and timeout telemetry.

The legacy direct `repair()` API still supports full-file mode for existing callers. The quality runner always uses bounded units. Small units may fail on a change that requires a coordinated cross-file transaction; such work stays INCOMPLETE rather than silently claiming success.

See the [measured gate verification](../evals/QUALITY-GATE-RESULTS.md) for test coverage, actual local failures and calibration limits. A real end-to-end COMPLETE result has not yet been established.
