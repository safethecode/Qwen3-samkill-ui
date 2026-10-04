# Semantic reference component generation

This experimental route translates a previously inspected reference decomposition into static element samples and an assembled page. It does not implement product workflows or certify commercial quality. The existing service route still handles those workflows separately.

Create a fresh target containing `DESIGN.md`, `REFERENCE.md`, official local assets, `design/typography.json` and `design/component-plan.json`. Prepare local fonts as described in [quality verification](QUALITY.md). The plan has:

- `reference`: inspected source, original observation region, comparison width, provenance and unknowns.
- `shared`: common visual relationships and chosen implementation constraints.
- `sharedCss`: explicitly host-supplied tokens, frame/card wrappers and typography.
- `elements`: IDs, focused prompts, allowed asset paths and standalone sample templates.
- `assembly`: a template with each `{{elementId}}` exactly once. Each sample includes only its own slot and reproduces its assembly slot's available width and parent padding.

An element can supply immutable `html` when its semantic structure and copy are already decided. That request returns CSS only; the model cannot insert an unrelated profile, action or image into the fixed fragment. `fixedMarkupElements` lists this host assistance in the generation record. This is useful for small bodies, labelled fields and footers; it is not evidence that the model independently discovered their structure.

Each model call writes one root with `data-ui-unit="elementId"` and CSS scoped to that root. Its prompt receives the shared contract and only that element's requirements. The runner scopes local class/type selectors to the component root; document selectors and sibling escapes are rejected. Scripts, inline handlers/styles and undeclared media are rejected. Accepted HTML/CSS is reused unchanged for its sample and assembly; the model never rewrites the completed page during assembly.

Run `node scripts/generate-components.mjs TARGET EVIDENCE`, with evidence outside the source directory. Use the normal local model environment variables. Each element has two bounded attempts and a five-minute request timeout. Raw responses, errors and input-bound checkpoints are retained. Set `QWEN_RESUME=1` to resume only unchanged inputs and runner state after an interrupted element; completed elements are validated and reused. Completed application source cannot be overwritten.

Outputs include `index.html`, `styles.css`, a static `app.js` and `sample-ID.html` per element. The report explicitly records shared CSS, font loading, selector scoping and assembly as host assistance. Rejected code and its validation error are supplied together on the bounded retry. No automatic typography normalization is applied to model CSS in this route. Browser checks and direct source/render comparison are still required. Scoped CSS is not proof of geometry, responsive behavior, complete visible labels or correct asset states.

Reuse the upstream reference-decompose E/O records and corrected prompts. Keep observed values distinct from chosen CSS values and product adaptations. Compare the actual element and whole-page renders at the same available width, then verify all relevant original guide/catalog requirements. Do not replace the reference-quality requirement with a component pass count.

## Repair one existing element

The component validator rejects all `+` and `~` selector combinators, including descendant siblings within a valid component root. Use a parent gap or `:not(:first-child)` for repeated-group spacing. Generation prompts state this restriction explicitly, and retry errors identify the rejected selector. This restriction has not been loosened for a particular reference.

Run `node scripts/repair-component.mjs TARGET EVIDENCE ID COMPONENT_JSON FAILURE_TEXT` with a fresh evidence directory outside the source. COMPONENT_JSON contains the exact current `{html, css}` fragment; FAILURE_TEXT describes the observed defect and relevant reference comparison. Use the `after` fragment from the latest accepted repair when repairing an element again. Never reuse stale generation fragments after changing that element.

The runner checks that the fragment occurs exactly once in both assembly and sample and that its CSS matches the current stylesheet. It supplies shared and element contracts to the local model and accepts at most three bounded patches. Fixed plan HTML stays immutable. Undeclared assets, escaping CSS, truncated output and source/harness changes are rejected before writes. The same accepted HTML is applied to sample and assembly, and unrelated elements and behavior remain untouched. Raw responses and before/after bindings are saved.

This is a reusable repair primitive, not an automatic visual defect selector or approval loop. Run browser checks and direct reference comparison after every repair. Preserve failed candidates as evidence. The caller must serialize inference and decide which element and defect require repair; a successful application reports APPLIED_NOT_APPROVED.
