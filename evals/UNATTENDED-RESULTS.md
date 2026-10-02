# Unattended local workflow results

Measured on 2026-10-03. The previous 7/19 and 8/19 artifacts failed most checks. The historical 19/19 artifact required operator diagnoses and visual feedback; it does not demonstrate unattended completion.

## Latest fresh-generation batch and stricter recheck

**Two of three fresh outputs pass all current automated checks.** The frozen v8 batch initially reported 25/25, 25/25 and 28/28, but screenshot review found the first output's paper covering its sample badges and modification dates. Those raw passes are not treated as three visually successful designs. Source hashes were verified unchanged after all three invocations. [Raw batch summary](results/unattended/release-v8/summary.json).

| Trial | First generation, v8 | Retained v8 score | Unchanged source, v9 | Elapsed |
| --- | ---: | ---: | ---: | ---: |
| Original contract 1 | 23/25 | 25/25 | 24/25 | 228 s |
| Original contract 2 | 23/25 | 25/25 | 25/25 | 282 s |
| Content/color/width variant | 25/28 | 28/28 | 28/28 | 302 s |

The v9 evaluator checks clipping and opaque overlap on desktop and mobile. Its lower score for the first artifact is an evaluator correction, not model regression. [Recheck reports](results/unattended/release-v9-recheck). All initial/final reports, screenshots and source are preserved under [v8 evidence](results/unattended/release-v8). No operator edited application code or supplied intermediate repair feedback during the batch. The final score gains came from deterministic typography/comment normalization, not model repairs. The three trials therefore measure generation plus host normalization; they do not establish reliable repair convergence or broad coding capability.

The local configuration uses Coder 30B for generation and 9B without thinking for bounded repairs. It meets the small study's two-of-three automated-output target on recheck, but a fully frozen v9 generation batch has not been run. Mobile action areas remain oversized in the original-contract outputs; the first also shows its editor on initial load. The variant has clearer desktop composition but inconsistent action emphasis. These are remaining visual issues, and Round 09 parity is not claimed.

## Retained-output repairs and visual refinement

The first v8 output was subsequently repaired from **24/25 to 25/25** by Qwen3.5 9B without thinking. Four ineffective or regressing candidates were rolled back before the fifth succeeded. No operator edited the application or supplied intermediate feedback within that repair invocation. The final source independently passed the final v9 checks at both viewport widths. [Repair study](results/unattended/visibility-repair/study.json), [report and screenshots](results/unattended/visibility-repair). This repair reused a saved output; it is not a fourth fresh-generation trial.

Separate screenshot-guided refinement then fixed the initially visible editor, oversized mobile action rows, weak edit emphasis and missing top spacing while retaining 25/25. It took four local-model responses plus deterministic removal of two unwanted CSS comments. The first two responses only partially followed the visual request; their reports are retained. **This phase used operator visual feedback and is not autonomous completion.** [Study and review prompts](results/unattended/visual-polish), [desktop](results/unattended/visual-polish/desktop.png), [mobile](results/unattended/visual-polish/mobile.png). Application edits came from the local model; the operator supplied diagnoses rather than replacement application code. Full Round 09 parity remains unproven.

## Earlier frozen v6 batch

**One of three invocations fully passed. The target of at least two out of three was not met.** The runner, model settings, evaluator and supplied references remained frozen for all three trials; their source hashes were verified after completion. There were no operator source edits or intermediate prompts. [Batch summary](results/unattended/release-v6/summary.json).

| Trial | First generation, v6 | Retained result, v6 | Unchanged source rechecked with v7 | Elapsed |
| --- | ---: | ---: | ---: | ---: |
| Original contract 1 | 23/25 | 25/25 | 25/25 | 196 s |
| Original contract 2 | 19/25 | 21/25 | 23/25 | 959 s |
| Content/color/width variant | 22/28 | 24/28 | 24/28 | 1,345 s |

The two gained checks in each v6 run came from host typography normalization, not accepted model repairs. Original contract 2 gained another two checks under v7 solely because the evaluator was corrected; its application source was unchanged. Failed repair candidates were retained locally and rolled back. This batch demonstrates a stronger initial artifact in one trial, but does not establish reliable unattended repair.

Each trial includes initial/final reports, desktop/mobile screenshots and its exact generated source: [trial 1](results/unattended/release-v6/repeat-1), [trial 2](results/unattended/release-v6/repeat-2), [variant](results/unattended/release-v6/variant). The [v7 rechecks](results/unattended/release-v7-recheck) use those same retained sources. These are evaluation artifacts, including the recorded failures, not approved application templates.

## Repair-model comparison

After correcting search evaluation and resetting unrelated retry context, a Qwen3.5 9B thinking-enabled repair run started from the second retained artifact at 23/25. It exhausted six rounds and retained 23/25 with no accepted repairs. Three responses exhausted the 8,192-token output budget; regressing and ineffective candidates were rejected. The retained application files were unchanged. [Study](results/unattended/hybrid-repair/study.json), [independent report](results/unattended/hybrid-repair/report.json). This is a reused-input repair comparison, not fresh generation, and does not support claiming that switching to the smaller reasoning model solves convergence.

The same six-round comparison with thinking disabled also retained 23/25 with no accepted repairs. [Study](results/unattended/nonthinking-repair/study.json), [independent report](results/unattended/nonthinking-repair/report.json). One attempted JavaScript fix assumed an HTML element existed when it did not. The backend now supplies all three current files as read context while preserving the narrower allowed write scope; this change is covered by a request-level regression test.

Providing that full read context alone still retained 23/25 after six rounds. [Study](results/unattended/full-context/study.json), [unchanged-source report](results/unattended/full-context/unchanged-source-report.json). A separate diagnostic query showed the model interpreting “example label” as an input's form label. Specifying a card's “sample-status badge” instead identified the actual rendering function.

The subsequent v8 diagnostic pilot clarified those badges and the person's name inside the paper preview. The same 9B non-thinking repair model then improved **23/25 to 25/25 in five rounds**, with two accepted model repairs and three rejected candidates. [Study](results/unattended/precise-feedback/study.json), [independent report](results/unattended/precise-feedback/report.json), [retained source and screenshots](results/unattended/precise-feedback). No application code was edited by the operator during the invocation. This is a repair-only result, not a fresh-generation success. Its mobile action area remains oversized, and full visual parity is not established.

## Completed earlier trials

| Workflow | Evaluator | Retained scores | Fully passing trials | Evidence |
| --- | --- | --- | --- | --- |
| Original OpenCode generation and local repairs | v3 | 11/19 | 0/1 | [Report](results/unattended/original/report.json) |
| Staged 9B generation, thinking disabled | v3 | 12/19 | 0/1 | [Report](results/unattended/nonthinking/report.json) |
| Staged 9B generation and repairs, thinking enabled | v3 | 19/19, 8/19, 10/19 | 1/3 | [Summary](results/unattended/thinking/summary.json) |
| Staged Coder 30B generation and numbered repairs | v5 | 21/25, 20/25, 17/28 | 0/3 | [Summary](results/unattended/numbered/summary.json) |

The 9B artifact that passed all 19 functional checks still omitted the reference's document-paper composition. Later evaluators add measurable design checks. Version 5 also corrects an evaluator mistake: filters may use buttons or a select control. Historical v3/v5 scores are not interchangeable.

The first numbered-repair runner exited early. Its retained artifact independently scored 21/25, but the original child stderr was not saved, so the exit cause is unconfirmed. The current runner retains stderr separately and does not treat a failed process as complete.

Version 6 also has a subsequently reproduced search-evaluation defect. It requires filtering immediately after filling the input even though the contract allows submission, and a failed search can leave its query active for the creation check. That can falsely attribute a hidden, successfully saved document to broken creation logic. Historical v6 reports are retained unchanged; they must not be treated as clean evidence for those two behaviors. Browser regressions cover a missing empty-state message, submit-based search and debounced search.

## Interrupted and development pilots

- The v4 design batch exhausted its first trial at 19/25, then was stopped during the second generation. [Summary](results/unattended/design-pilot/summary.json). This is not three completed trials.
- A Qwen3.5 27B repair pilot was stopped after short responses took roughly 30–65 seconds. It is not included in the completion count.
- A reused 30B artifact improved from 21/25 to 24/25 through typography normalization and exact substring repairs, then exhausted ten rounds. [Retained report](results/unattended/repair-pilot/report.json). It was not fresh generation. Screenshot inspection still showed an empty stage above the document, an insufficiently styled creation button and weak action hierarchy.
- A 500-character-match pilot was also stopped after diagnostic replay showed a rejected patch could improve 13/25 to 19/25. That replay is operator-assisted evidence of a host limitation, not an autonomous success. [Interrupted summary](results/unattended/match-limit/summary.json). The current host allows up to 4,000 matching characters and 8,000 replacement characters.
- A single-replacement pilot was stopped when fixing optional introduction validation required coordinated HTML and JavaScript edits. [Interrupted summary](results/unattended/single-patch/summary.json). The current repair transaction supports up to three bounded replacements.
- A compatible-nested-patch pilot was stopped after reproducing a host rejection of two equivalent overlapping replacements. [Interrupted summary](results/unattended/nested-patches/summary.json). The host now merges only provably equivalent nested changes.
- After those corrections, a repair-only Coder run retained 22/25 from 19/25 after ten rounds. [Before](results/unattended/coder-repair/before.json), [retained report](results/unattended/coder-repair/report.json). Two gained checks came from deterministic typography normalization; one came from a model correction to creation after editing.
- A later dense 27B pilot took 238 seconds for its first 749-token response, which failed exact matching. It was stopped for latency and is not a completed accuracy trial. [Study record](results/unattended/dense-27b/study.json).
- A complete-file fallback pilot retained 23/25 from 22/25 by fixing unsafe user-text rendering, then was stopped while retry context was revised. [Study record](results/unattended/file-pilot/study.json), [retained report](results/unattended/file-pilot/report.json).

All these failures are retained; development pilots are not counted as independent successes.

## Current workflow

Generation writes HTML, behavior and CSS in separate validated responses. The host supplies the contract, compact skill and reference observations, never a completed example application. Each repair receives the actual browser failure and current source, then proposes up to three targeted exact replacements. After a failed attempt it can return complete affected files, validated before saving. Failed code is excluded from the next prompt. When the scheduler rotates to a different failed check, it clears the previous check's retry context and restores the new check's narrow file scope. Invalid, truncated and ambiguous responses are rejected. A candidate must fix a failing check without losing a previously passing one; otherwise the previous accepted source is restored.

Scores include deterministic comment removal and CSS typography normalization. These are host operations, not evidence of better model reasoning. Typography normalization is attempted once per viewport failure; unresolved cases return to the model.

The current v9 evaluator retains 25 checks, or 28 for the declared variant. It includes visible form-field and placeholder typography, all three desktop columns, mobile stacking and actual document content on white paper surfaces. Search runs in isolated storage and accepts submission or a bounded input delay. Its machine report keeps `visualReview: UNVERIFIED`. Full visual equivalence and general coding reliability remain unproven.

## Screenshot observations

The first v6 release artifact passed all 25 machine checks, but its creation button retained a native browser appearance, mobile actions stacked into a disproportionately large area, and the preview cropped email content. The second artifact styled its primary action more clearly but placed the person's name outside the paper preview and omitted visible example badges. The variant also placed names outside the paper, omitted example labels and reduced mobile outer spacing below the contract minimum; its user-text rendering check remained failed. These observations are qualitative operator review, not local-model judgments. They do not establish visual parity with the upstream Round 09 reference.

All machine scores include file-presence checks and assertions specific to this small fixture. A score such as 25/25 does not mean 25 independent product workflows or complete design compliance. Automated completion and screenshot review are reported separately.

## Environment and reproduction

Windows, Intel Core i5-12600K, 32 GB RAM, RTX 3080 Ti with 12 GB VRAM; Ollama 0.35.0, OpenCode 1.18.33, Node 24.19.0 and Playwright 1.58.2 using installed Chrome. The latest batch uses the installed `qwen-local-dev` alias of Qwen3 Coder 30B Q4 for generation and Qwen3.5 9B for repairs, thinking disabled, temperature 0.7, context 32768 and output budget 8192. Earlier development pilots used temperature 0.2. The repository Modelfile provides equivalent Coder sampler settings under the portable `qwen-ui` name.

Follow the [README](../README.md) and [protocol](AUTONOMOUS-PROTOCOL.md). Each batch starts two original-contract trials and one declared content/color/width variant from fresh directories, with ten rounds each. The workflow records source hashes and independently evaluates retained files. Three trials are a small operational sample, not a statistical reliability estimate. Raw local responses are excluded from published evidence; shared reports contain no personal machine paths.
