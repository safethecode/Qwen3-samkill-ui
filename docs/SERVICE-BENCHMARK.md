# Cross-service comparison

This benchmark separates three questions: can the local model complete a requested workflow, can it render a usable interface at multiple widths, and does its visual result approach a supplied reference? Functional counts answer only the first two questions within the tested scope. They never certify visual parity.

## Cases

The frozen briefs are in `evals/service-cases.mjs`. Available upstream rounds are 01 (travel itinerary), 02 (mentor discovery), 03 (health home), 04 (pet-friendly cafe booking), 08 (cooking), 09 (resume workspace) and 10 (wedding invitation). Rounds 05–07 are absent from the inspected checkout. The first three are static translation exercises. Later rounds are scoped workflow recreations, not copies of every feature in the original products.

Three new services are planned before source generation:

| Service | User task | Required visual structure | Main executed workflow |
| --- | --- | --- | --- |
| Ondam facilities desk | Triage shared-office maintenance | Dense queue table, navigation and detail panel | Create request, complete selected request, reload |
| Teum workshop booking | Choose a small-group craft class | Editorial lead, class catalogue and booking form | Search, reject empty booking, save and cancel |
| Galpi learning room | Follow a four-week accessibility course | Course navigation, dominant lesson prose and quiet progress | Complete lesson, save independent notes, reload |

Names and sample data are fictional. There are no connected payments, venues, medical decisions or attendance servers. Local generation receives the briefs, structural observations and the skill; original implementation source is not supplied. Original photographs/brand assets are not supplied either. Consequently media-dependent fidelity must be assessed as a limitation, not quietly scored as equivalent. Fresh product scopes intentionally differ from upstream full applications.

## Run

Install dependencies with `npm ci`. Set `CHROME_PATH` when using an installed Chrome. Ollama must already expose the selected model.

```powershell
$env:QWEN_GENERATE_MODEL = 'qwen3-coder:30b'
$env:QWEN_GENERATE_THINK = 'false'
$env:QWEN_NUM_GPU = '12'
$env:QWEN_NUM_CTX = '16384'
$env:QWEN_NUM_BATCH = '128'
node scripts/service-benchmark.mjs runs/service-study dispatch workshop learning round-01 round-02 round-03 round-04 round-08 round-09 round-10
```

Resource values are examples, not universal recommendations. Partial offload can be slower but fit alongside other GPU applications. Do not benchmark model switching while retaining both large models on a constrained device. Record resource settings and avoid presenting contended run times as isolated hardware benchmarks.

Generation has five bounded units: HTML shell, JavaScript state/rendering, JavaScript interactions, CSS structure and CSS responsive/control states. Later units append to earlier units without rewriting them. Every fragment must parse; the combined JavaScript must also parse, detecting duplicated declarations. The HTML interface is checked before dependent behavior is generated. Each request has a finite output budget and deadline, and one retry with its actual error.

Validated units are checkpointed. Set `QWEN_RESUME=1` and rerun the same command to skip verified completed cases and resume incomplete ones without regenerating validated units. Contract, skill, interface, model settings and stage definitions must match the checkpoint. Existing reports remain in the attempt history. Use a fresh output directory when intentionally changing these inputs.

Model response text and timing counters are retained; reasoning text is not requested or published. The runner removes parsed comments deterministically; this host assistance is disclosed in the study. Source hashes bind the generated sample to its report.

```sh
node scripts/reference-capture.mjs PATH_TO_SAMKILL_UI runs/reference-captures
node scripts/service-gallery.mjs runs/service-study runs/reference-captures runs/comparison-gallery
```

Open `runs/comparison-gallery/index.html` to compare equal-width screenshots. Reference capture measures no upstream interactions; it only records visible states. Inspect missing media, density, hierarchy, alignment, mobile adaptation and action priority directly, alongside functional failures.

## Bounded repair

```sh
node scripts/service-repair.mjs runs/service-study/dispatch/source dispatch 4
```

This optional functional repair pass selects one failure and one bounded source excerpt per request. Full browser checks rerun after every candidate. A changed candidate is accepted only when more checks pass without losing any previous PASS. When multiple small edits are needed to fix one check, non-regressing intermediate changes can remain staged within the same attempt budget. They are not accepted or reported as improvement; remaining staged changes are rolled back at budget exhaustion. Rejected and staged candidates are retained as evidence, and rollback requires the runner still to own their source. Timeout consumes an attempt; the budget cannot expand silently. A successful result is called FUNCTIONAL_PASS and still carries visual UNVERIFIED.

This command does not claim every control, storage error or accessibility state has been tested. The fixtures cover representative flows. The separate `quality` command remains bound to its resume functional evaluator; do not point it at unrelated services and interpret the resulting counts as universal certification.
