# Qwen3 samkill-ui

Local-first UI development skills for Qwen and OpenCode, adapted from [samkill-ui](https://github.com/safethecode/samkill-ui). A compact entry skill loads detailed design references on demand. A restricted UI agent avoids unrelated MCP tools, and a bounded evaluation loop feeds real browser failures back to the model.

This does not train model weights or make every model reliable. The included evaluation covers one small resume-manager task. The earlier 19/19 result required operator feedback and was not autonomous completion. The latest three fresh outputs scored 24/25, 25/25 and 28/28 when rechecked for obscured badges; two passed every automated check. See the [unattended results](evals/UNATTENDED-RESULTS.md) for fresh-generation failures and measured improvements. A separate local repair brought the remaining saved output to 25/25; subsequent screenshot-guided polish is labeled operator-assisted in the results. Passing the fixture does not establish visual parity with samkill-ui's full design rounds.

## Install in a project

Requires Node.js 22+, OpenCode and a running local Ollama server. Clone this repository, then run:

```sh
npm ci
node scripts/setup.mjs /path/to/your-project
```

The installer adds `.opencode/skills/qwen-samkill-ui` and merges the `local-ui` agent into that project's `opencode.json`. It preserves model, provider, MCP and other agent settings. An existing JSON file is backed up; JSONC and existing installations require a manual merge. It never changes global configuration.

In the target project, select the `local-ui` agent or run:

```sh
opencode run --agent local-ui "Read qwen-samkill-ui and implement DESIGN.md. Save the files and verify the result."
```

On Windows, use `opencode.cmd` interactively if PowerShell blocks the `.ps1` shim. For the iteration script, set `OPENCODE_BIN` to the actual `opencode.exe` file; it launches without a shell.

## Local model configuration

The example model is Qwen3 Coder 30B. Hardware requirements and speed depend on quantization, context and GPU memory. Start with an already working Ollama model if available.

```sh
ollama pull qwen3-coder:30b
ollama create qwen-ui -f profiles/Modelfile
ollama pull qwen3.5:9b
```

Configure your OpenCode Ollama provider with `@ai-sdk/openai-compatible`, base URL `http://127.0.0.1:11434/v1`, model ID `qwen-ui`, context limit `32768`, output limit `8192` and tool calling enabled. Then select `ollama/qwen-ui`. The Modelfile sets the server context; changing OpenCode's advertised context alone is insufficient. Check `ollama ps` after loading. Existing plugins may override output limits, so inspect any `chat.params` hooks.

The Coder sampler follows the [upstream model card](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct): temperature 0.7, top-p 0.8, top-k 20 and repetition penalty 1.05. The direct backend accepts `QWEN_TEMPERATURE` for comparisons and records sampling settings in benchmark summaries. Earlier development trials used temperature 0.2; changing this setting alone is not proven to resolve their failures.

The UI agent allows local file tools, shell checks, skills and optional `vision_analyze`. MCP tools are disabled for this agent by default. If external design research is required, enable only the exact research tools you need in your project agent settings. Do not enable a whole unrelated analytics tool collection. Image interpretation requires a vision-capable model or a separately configured vision bridge; this package does not install one.

## Reproduce the evaluation

For broader evaluation, use the [cross-service benchmark](docs/SERVICE-BENCHMARK.md). It includes every available upstream round (01, 02, 03, 04, 08, 09, 10) and three separately planned services: maintenance dispatch, workshop booking and a learning room. It generates real source, exercises service-specific browser flows and captures 1440/390/320px screenshots. Static translation, functional completion and visual comparison remain separate results. Rounds 05–07 are unavailable in the inspected upstream checkout.

For unattended functional **and visual** gating, use [the quality workflow](docs/QUALITY.md): `npm run quality -- TARGET 4`. It requires desktop/mobile reference images and a `QUALITY.json` manifest, rejects regressions, escalates stalled repairs and requires a separate final visual audit. The functional-only commands below do not certify design completion.

The quality runner now repairs one bounded source excerpt per request, rotates stalled work instead of requesting larger files, and splits each visual review into three two-criterion requests. Optional `QWEN_NUM_GPU`, `QWEN_NUM_CTX` and `QWEN_NUM_BATCH` settings help fit local resource budgets. Splitting output does not fix model loading or GPU contention by itself; timing evidence distinguishes these stages.

For unattended generation without OpenCode tool calling, the staged Ollama backend writes HTML, JavaScript and CSS separately, passing earlier files to later stages. It starts from the design contract, not the saved example. The measured configuration generates with Coder 30B and uses Qwen3.5 9B for bounded repairs:

```powershell
$env:QWEN_GENERATE_MODEL = 'qwen-ui'
$env:QWEN_GENERATE_THINK = 'false'
$env:QWEN_REPAIR_MODEL = 'qwen3.5:9b'
$env:QWEN_REPAIR_THINK = 'false'
$env:QWEN_TEMPERATURE = '0.7'
node scripts/benchmark.mjs runs/unattended-check
```

Install dependencies and the browser as described below first, then create `qwen-ui` using the Modelfile. The destination must not already exist. This runs three fresh ten-round trials and records every trial, source hashes, initial/final scores, elapsed times and independent final reports. It calls Ollama directly; no cloud model is required. This configuration uses Qwen3 Coder 30B for generation and Qwen3.5 9B for repairs, with thinking disabled. Both run locally and sequentially. The [unattended evaluation protocol](evals/AUTONOMOUS-PROTOCOL.md) defines scope and limitations. Version 9 retains 25 checks, including form/placeholder typography and all three desktop columns; the variant has 28. Search is tested in isolated browser storage and accepts input-driven or submitted filtering, so a failed search does not contaminate the creation check. Sample status is checked on each card at both viewport widths, including clipping and opaque overlap; feedback distinguishes card badges, form labels, personal names and document titles. Passing these does not certify overall visual quality.

For one existing design contract, set these variables and run `node scripts/iterate.mjs TARGET 10`. Staged generation requires a fresh target containing DESIGN.md and no application source files. Omit `QWEN_GENERATE_MODEL` to use the OpenCode generation backend instead.

Put reference observations in the target's `REFERENCE.md` to supply them to generation and repair. For the resume fixture's additional design checks, set `QWEN_DESIGN_CHECKS=1`; the benchmark enables this automatically. The general design instructions can be reused, but the evaluator itself remains specific to this resume task.

Applied candidates are normalized to remove parsed code comments, then checked in the browser. The first attempt on a typography failure uses a CSS parser to enforce the fixture's 14px/500 minimum; it preserves larger/bolder control styles. This is deterministic host assistance, not a model-generated fix. Candidates that regress any accepted check or fix no failing check are backed up and reverted. Failed OpenCode repair processes restore the previous source. After two unsuccessful attempts on a check, the scheduler gives other failures a turn and clears retry context belonging to the previous check. A finite round limit still applies; failure remains failure.

The [measured results](evals/RESULTS.md) document an assisted local run from 7/19 to 19/19 fixture checks, including limitations and screenshots. To check the saved example without generating anything, run `node scripts/evaluate.mjs examples/resume runs/recheck` after installing the dependencies and browser below.

```sh
npx playwright install chromium
node -e "require('node:fs').mkdirSync('runs/resume',{recursive:true})"
```

Copy `evals/resume-contract.md` to `runs/resume/DESIGN.md`, then:

```sh
node scripts/setup.mjs runs/resume
node scripts/iterate.mjs runs/resume 3
```

Use `QWEN_MODEL=ollama/qwen-ui` to choose the model. In PowerShell set `$env:QWEN_MODEL = 'ollama/qwen-ui'`. OpenCode must already have its provider configured. `OPENCODE_BIN` overrides the executable path. `CHROME_PATH` optionally selects an existing Chrome executable.

The OpenCode backend runs with `--pure` to exclude plugin overrides, then executes independent Playwright checks. Existing files are checked before another model call. Each repair starts a fresh model session with one concrete failure and the current files, preventing stale conversation history from dominating the next fix. It runs up to the requested number of rounds (1–10), rerunning the full fixture after every repair. Each invocation gets a fresh `run-*` directory containing streaming logs, screenshots and JSON reports. Standard error is retained in separate `.stderr` files. Infrastructure failures stop the run; exhausted rounds return a nonzero exit status. No task is scheduled in the background.

To inspect any existing fixture without another model call:

```sh
node scripts/evaluate.mjs runs/resume runs/evidence
```

For constrained repairs through Ollama directly, set `QWEN_REPAIR_MODEL` to your installed local model. It supplies the failing check, all three current source files as read context and the design contract. The response schema and write validator still restrict edits to the affected files; seeing HTML does not grant permission to rewrite it. Each initial response contains up to three exact substring replacements, each matching at most 4,000 characters with a replacement of at most 8,000 characters. Related HTML and JavaScript fixes are applied atomically; equivalent nested replacements are merged. No tool execution is delegated to the repair model. Unchanged, ambiguous, malformed, out-of-scope and truncated responses are rejected; original files are backed up before applying valid changes. Patched source must parse before any file is changed. Every applied change is checked in the browser. Without `QWEN_GENERATE_MODEL`, initial generation still uses OpenCode. Generation quality can still regress and the loop does not guarantee convergence.

After a failed attempt, the backend switches to complete replacements of the affected files. Each file must parse before it can be saved, and the same full browser regression gate still applies. `QWEN_REPAIR_MODE=files` forces this mode from the start. Failed response code stays in evidence files and is excluded from the next prompt; the current source and concrete failing requirement take precedence. This reduces dependence on the model copying a large matching fragment perfectly.

In PowerShell:

```powershell
$env:QWEN_REPAIR_MODEL = 'qwen3.5:9b'
$env:QWEN_REPAIR_THINK = 'false'
node scripts/iterate.mjs runs/resume 10
```

`OLLAMA_URL` overrides the default local endpoint. Raw model reasoning is not written to repair logs. Responses and validation evidence are retained locally under the run directory; review them before sharing.

For a concrete visual correction, write a review JSON with `name: "visual-review"`, `status: "FAIL"`, and `detail` describing differences actually observed in screenshots. Optional `files` restricts the repair to `index.html`, `styles.css` and/or `app.js`. Optional `imagePaths` supplies up to two local images to a vision-capable repair model; order them as reference then current output. Keep each review focused on one component or relationship.

```sh
node scripts/refine.mjs runs/resume review.json runs/visual-repair-1
node scripts/evaluate.mjs runs/resume runs/visual-evidence-1
```

The evidence directory for refinement must be new. Refinement uses one bounded source unit and disables thinking by default; `QWEN_REPAIR_THINK` can explicitly override it. Large multi-component requests must be divided into separate observed defects. A refinement applies patches but never certifies visual quality: inspect its new desktop/mobile screenshots. The loop removes parsed code comments deterministically when that check fails, preserving strings and JavaScript line breaks, then reruns the checks.

Checks include file existence, JavaScript syntax, example documents, visible labels, create/reload, independent duplication, archive/restore, create after edit, typography, runtime errors, required-title validation, parsed code comments and overflow at 1440/390 pixels. The evaluator intentionally uses the Korean control names in the supplied contract. Adapt it for another application; it is not a general-purpose UI test suite.

Review the screenshots separately for hierarchy, reference fidelity, content density, layout and typography. Machine reports retain `visualReview: UNVERIFIED`; the loop does not equate automated success with design approval.

## Repository

- `skills/qwen-samkill-ui`: compact skill and on-demand upstream references
- `profiles`: UI agent and Ollama model example
- `scripts`: project installer, fixture evaluator and repair loop
- `evals`: task contract and measured results
- `examples/resume`: historical operator-assisted application artifact
- `test`: installer, patch safety, process and evaluation regression checks

Upstream provenance and adaptation details are in [UPSTREAM.md](UPSTREAM.md). The Python design gate has Windows-compatible ledger locking. Run `npm test` for Node regression tests and `python -m unittest discover -s test` for gate tests. The Node/Playwright fixture evaluator works on Windows directly.
