# Required skill-first workflow

Before planning, writing prompts, changing UI, running local generation or changing quality gates, read [qwen-samkill-ui](skills/qwen-samkill-ui/SKILL.md) and its [operating rules](skills/qwen-samkill-ui/references/operating-rules.md). Apply the relevant upstream guide before its phase; do not treat a link to a guide as evidence that it was followed. Explicit user instructions take precedence. These instructions apply to host-authored scaffolding and model-generated output equally.

For a UI task, use this order:

1. Read repository status, the latest source-bound report and the current user request. Preserve user files and historical evidence. Check active inference before starting another request; never compete with an existing local model job.
2. Establish platform and product scope. Mobile-only stays a bounded vertical mobile screen in a wide browser. Do not invent desktop layouts, headers, sections, copy or interactions. Missing reference information remains unknown.
3. Inspect the actual relevant UI Bowl reference when reference research is requested. Read the upstream research/decompose guides, then record observed facts, chosen adaptations and unknowns separately. Decompose purpose, navigation, semantic surfaces, hierarchy, element ownership and state transitions before styling fragments.
4. Read the relevant design/implementation guides. Prepare compact component contracts and pass applicable guide text and source hashes to the local model. Check that host CSS and prompts do not contradict the user, one another or text enlargement requirements.
5. Run actual Ollama/Qwen generation serially and keep raw responses, exact model/settings, source/harness hashes and failures. Decompose long work; use bounded local repairs. Never call a host-written fix a Qwen result. Document any host assistance.
6. Render the complete source and required states. Compare the reference and output at the same displayed width. Test navigation, assets, typography, grouping, interactions, persistence, failure recovery and enlarged text. A wide viewport is a scope regression test, not permission to design a desktop variant.
7. Read the upstream review guide and assess the applicable 75-rule catalog and eight-guide coverage. Unknown is not pass. Functional counts, CSS presence and asset-load counts do not establish reference-level quality. Continue improving generation and scoped repair rather than only adding rejection gates.
8. Keep public files free of private paths, credentials and signed URLs. Add no code comments. Keep implementation/demo notices out of product UI unless requested. Commit logical changes separately and push when authorized; report actual tests, visible results, remaining limitations and the location of the latest preview.

For documentation-only work, read the skill and applicable operating rules, then limit execution to the relevant changes and verification. Do not start unnecessary inference or UI research.

Do not claim that this instruction file makes model compliance automatic. Verify that guide text reaches the runner and that actual generated behavior satisfies the contract. Previously authorized autonomous work does not need repeated routine approval.
