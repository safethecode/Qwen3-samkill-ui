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

The number is the maximum visual repair attempts, from 0 to 10. Zero performs inspection and confirmation only. An optional fourth CLI argument selects a manifest outside the target: `node scripts/quality.mjs TARGET 4 PATH_TO_QUALITY_JSON`.

Default models are Coder 30B for generation and Qwen3.5 9B for repairs and vision review. They run sequentially against local Ollama. The reviewer starts a fresh request for each viewport, sees only reference/current images, the contract and observations, and receives no generation conversation or previous scores. Sharing model weights still creates correlated judgment errors; separate requests are not independent human reviewers.

```powershell
$env:QWEN_GENERATE_MODEL = 'qwen-ui'
$env:QWEN_REPAIR_MODEL = 'qwen3.5:9b'
$env:QWEN_REVIEW_MODEL = 'qwen3.5:9b'
$env:QWEN_FUNCTIONAL_ROUNDS = '3'
npm run quality -- runs/my-ui 4
```

`qwen-ui` is the optional portable alias from the README. `OLLAMA_URL` changes the endpoint. Generation/repair thinking default to false and can use their existing environment overrides; review thinking is disabled to bound the response. A reviewer must advertise vision support. No cloud fallback is used.

## Gates and recovery

1. Validate the manifest, both images and vision capability before generating or repairing.
2. Complete the existing functional loop and independently rerun its browser checks, including design geometry. Capture fresh desktop/mobile images.
3. Review composition, hierarchy, spacing, typography, document content and action priority at both widths. Every criterion needs evidence, score at least 4/5 and confidence at least 0.8; all reported issues must be resolved. Confidence is self-reported, not a calibrated probability.
4. Feed one localized defect to the repair model. Validate exact patches before writing. After two stalled attempts, request complete affected files instead. Preserve other source and all passing functional checks. Parsed comments are removed deterministically before evaluation.
5. Reject and restore candidates that regress any protected visual criterion, introduce functional failures or make no measured progress. Keep rejected evidence locally. Do not relax thresholds when the model struggles.
6. A separate adversarial audit must pass both viewports using the same source and screenshot hashes. Source, contract or reference changes invalidate completion.

`QUALITY-RESULT.json` and `UI-STATUS.md` record RUNNING, COMPLETE or INCOMPLETE. COMPLETE means the declared automated gates passed; it does not guarantee samkill-ui parity on every task. Errors, truncated or malformed review, unavailable vision and exhausted rounds return a nonzero status. Never interpret attempted repair as completion.

Each `quality-*` directory retains functional logs, screenshots, review responses without private reasoning, reference/source bindings, repair requests and decisions. Raw source snapshots may contain project data; review them before sharing. A target lock prevents simultaneous quality runs. An interrupted process can leave `.quality-lock`; verify no process still uses that target before removing it.

Visual judgments can be wrong or inconsistent. Strict rollback can reject a useful edit when the judge's scores fluctuate. Reference selection and representative positive/negative calibration remain necessary; adding gates improves rejection discipline without guaranteeing every task converges.
