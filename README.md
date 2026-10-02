# Qwen3 samkill-ui

Local-first UI development skills for Qwen and OpenCode, adapted from [samkill-ui](https://github.com/safethecode/samkill-ui). A compact entry skill loads detailed design references on demand. A restricted UI agent avoids unrelated MCP tools, and a bounded evaluation loop feeds real browser failures back to the model.

This does not train model weights or make every model reliable. The included evaluation covers one small resume-manager task. Passing it does not establish visual parity with samkill-ui's full design rounds.

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
```

Configure your OpenCode Ollama provider with `@ai-sdk/openai-compatible`, base URL `http://127.0.0.1:11434/v1`, model ID `qwen-ui`, context limit `32768`, output limit `8192` and tool calling enabled. Then select `ollama/qwen-ui`. The Modelfile sets the server context; changing OpenCode's advertised context alone is insufficient. Check `ollama ps` after loading. Existing plugins may override output limits, so inspect any `chat.params` hooks.

The UI agent allows local file tools, shell checks, skills and optional `vision_analyze`. MCP tools are disabled for this agent by default. If external design research is required, enable only the exact research tools you need in your project agent settings. Do not enable a whole unrelated analytics tool collection. Image interpretation requires a vision-capable model or a separately configured vision bridge; this package does not install one.

## Reproduce the evaluation

The [measured results](evals/RESULTS.md) document an assisted local run from 7/19 to 19/19 fixture checks, including limitations and screenshots. To check the saved example without generating anything, run `node scripts/evaluate.mjs examples/resume runs/recheck` after installing the dependencies and browser below.

```sh
npx playwright install chromium
mkdir runs/resume
```

Copy `evals/resume-contract.md` to `runs/resume/DESIGN.md`, then:

```sh
node scripts/setup.mjs runs/resume
node scripts/iterate.mjs runs/resume 3
```

Use `QWEN_MODEL=ollama/qwen-ui` to choose the model. In PowerShell set `$env:QWEN_MODEL = 'ollama/qwen-ui'`. OpenCode must already have its provider configured. `OPENCODE_BIN` overrides the executable path. `CHROME_PATH` optionally selects an existing Chrome executable.

The loop runs OpenCode with `--pure` to exclude plugin overrides, then executes independent Playwright checks. Existing files are checked before another model call. Each repair starts a fresh model session with one concrete failure and the current files, preventing stale conversation history from dominating the next fix. It runs up to the requested number of rounds (1–10), rerunning the full fixture after every repair. Each invocation gets a fresh `run-*` directory containing streaming logs, screenshots and JSON reports. Infrastructure failures stop the run; exhausted rounds return a nonzero exit status. No task is scheduled in the background.

To inspect any existing fixture without another model call:

```sh
node scripts/evaluate.mjs runs/resume runs/evidence
```

For constrained repairs through Ollama directly, set `QWEN_REPAIR_MODEL=qwen3.5:9b` before running the loop. Pull that model first with `ollama pull qwen3.5:9b`. This optional backend uses thinking mode and structured JSON patches for existing files; initial generation still uses OpenCode. It supplies the failing check, relevant source files and the design contract. No tool execution is delegated to the repair model. Unchanged, ambiguous, malformed, out-of-scope and truncated patches are rejected; original files are backed up before applying valid patches. Every applied patch is checked in the browser. Generation quality can still regress and the loop does not guarantee convergence.

In PowerShell:

```powershell
$env:QWEN_REPAIR_MODEL = 'qwen3.5:9b'
node scripts/iterate.mjs runs/resume 10
```

`OLLAMA_URL` overrides the default local endpoint. Raw model reasoning is not written to repair logs. Responses and validation evidence are retained locally under the run directory; review them before sharing.

For a concrete visual correction, write a review JSON with `name: "visual-review"`, `status: "FAIL"`, and `detail` describing differences actually observed in screenshots. Optional `files` restricts the repair to `index.html`, `styles.css` and/or `app.js`. Optional `imagePaths` supplies up to two local images to a vision-capable repair model; order them as reference then current output. Keep each review focused on one component or relationship.

```sh
node scripts/refine.mjs runs/resume review.json runs/visual-repair-1
node scripts/evaluate.mjs runs/resume runs/visual-evidence-1
```

The evidence directory for refinement must be new. `QWEN_REPAIR_THINK=false` disables thinking for a small, concrete visual edit; thinking stays enabled by default. Large multi-component requests may still exceed the output budget and will be rejected. A refinement applies patches but never certifies visual quality: inspect its new desktop/mobile screenshots. The loop removes parsed code comments deterministically when that check fails, preserving strings and JavaScript line breaks, then reruns the checks.

Checks include file existence, JavaScript syntax, example documents, visible labels, create/reload, independent duplication, archive/restore, create after edit, typography, runtime errors, required-title validation, parsed code comments and overflow at 1440/390 pixels. The evaluator intentionally uses the Korean control names in the supplied contract. Adapt it for another application; it is not a general-purpose UI test suite.

Review the screenshots separately for hierarchy, reference fidelity, content density, layout and typography. Machine reports retain `visualReview: UNVERIFIED`; the loop does not equate automated success with design approval.

## Repository

- `skills/qwen-samkill-ui`: compact skill and on-demand upstream references
- `profiles`: UI agent and Ollama model example
- `scripts`: project installer, fixture evaluator and repair loop
- `evals`: task contract and measured results
- `examples/resume`: verified local-model application artifact
- `test`: installer, patch safety, process and evaluation regression checks

Upstream provenance and adaptation details are in [UPSTREAM.md](UPSTREAM.md). The Python design gate has Windows-compatible ledger locking. Run `npm test` for Node regression tests and `python -m unittest discover -s test` for gate tests. The Node/Playwright fixture evaluator works on Windows directly.
