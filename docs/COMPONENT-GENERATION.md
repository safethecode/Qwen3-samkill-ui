# Semantic reference component generation

This experimental route translates a previously inspected reference decomposition into static element samples and an assembled page. It does not implement product workflows or certify commercial quality. The existing service route still handles those workflows separately.

Create a fresh target containing `DESIGN.md`, `REFERENCE.md`, official local assets, `design/typography.json` and `design/component-plan.json`. Prepare local fonts as described in [quality verification](QUALITY.md). The plan has:

- `reference`: inspected source, original observation region, comparison width, provenance and unknowns.
- `shared`: common visual relationships and chosen implementation constraints.
- `sharedCss`: explicitly host-supplied tokens, frame/card wrappers and typography.
- `elements`: IDs, focused prompts, allowed asset paths and standalone sample templates.
- `assembly`: a template with each `{{elementId}}` exactly once. Each sample includes only its own slot and reproduces its assembly slot's available width and parent padding.

Each model call writes one root with `data-ui-unit="elementId"` and CSS scoped to that root. Its prompt receives the shared contract and only that element's requirements. Styles cannot rewrite other elements through global selectors or sibling escapes. Scripts, inline handlers/styles and undeclared media are rejected. Accepted HTML/CSS is reused unchanged for its sample and assembly; the model never rewrites the completed page during assembly.

Run `node scripts/generate-components.mjs TARGET EVIDENCE`, with evidence outside the source directory. Use the normal local model environment variables. Each element has two bounded attempts and a five-minute request timeout. Raw responses, errors and input-bound checkpoints are retained. Set `QWEN_RESUME=1` to resume only unchanged inputs and runner state after an interrupted element; completed elements are validated and reused. Completed application source cannot be overwritten.

Outputs include `index.html`, `styles.css`, a static `app.js` and `sample-ID.html` per element. The report explicitly records shared CSS, font loading and assembly as host assistance. No automatic typography normalization is applied to model CSS in this route. Browser checks and direct source/render comparison are still required. Scoped CSS is not proof of geometry, responsive behavior, complete visible labels or correct asset states.

Reuse the upstream reference-decompose E/O records and corrected prompts. Keep observed values distinct from chosen CSS values and product adaptations. Compare the actual element and whole-page renders at the same available width, then verify all relevant original guide/catalog requirements. Do not replace the reference-quality requirement with a component pass count.
