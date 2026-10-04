# Decomposed layout for local models

Read the upstream decomposition guide and its element contract. Record observed reference relationships separately from chosen implementation values and unknowns. Do not infer a font, asset origin or interaction from an uninspected screenshot.

## Before generation

Match the reference and candidate screen purpose and visible state before comparing them. A checkout screenshot does not specify a catalogue hero. For a photo-led reference, obtain and inspect suitable real media with provenance before implementation; abstract decorative shapes are not a substitute for missing product imagery. Record substitutions explicitly. For illustration-led references, preserve that medium instead of imposing photography. Freeze the initial render before changing the contract.

Define shared typography, colors, spacing, surfaces and responsive behavior. Divide the screen into semantic elements with explicit owned text, assets, actions and states. Give each element its available width, parent padding, adjacent read-only structure and forbidden duplicate content. Assign inter-element spacing to the assembly so two elements cannot both add it.

Preserve the reference's grouping. Identity, description, price and actions need a deliberate reading order. A favorite that belongs to identity must stay there; price and consultation can share a quiet footer only where the reference and available space support it. Avoid adding separators, large buttons or explanatory paragraphs absent from the contract. At narrow widths, wrap the intended groups rather than shrinking type or forcing every control onto one row. These are reference-specific relationships, not a universal card template.

Use real font files and verify actual rendered families, glyph fallback and weights through the typography checks. Use verified official icon assets and the required selected/unselected states. Asset presence alone does not prove matching size, paint, placement or behavior.

## Bounded implementation

The repository's explicit static pilot is `node scripts/generate-components.mjs TARGET EVIDENCE`, with `design/component-plan.json` and typography prepared first. See the repository's `docs/COMPONENT-GENERATION.md` for its schema. It generates one element at a time and assembles accepted fragments without a model rewrite. Fixed semantic HTML may request CSS only. Record host-supplied markup, shared CSS, fonts and selector scoping as assistance. This CLI is not an automatic OpenCode route and does not implement a complete product workflow by itself.

Render each element in a sample with the same available width and horizontal inset as its assembled slot. Review samples and the full page at desktop and mobile widths. Repair one owned region while retaining correct neighbors; rerun affected checks and the assembled view. The pilot's resume requires unchanged inputs; do not claim changed-plan checkpoints remain valid. Complete all requested interactions separately, including empty, error and recovery states.

When independent generations repeatedly break an already agreed structural relationship, move that relationship into the shared assembly scaffold and supply immutable semantic HTML before requesting local CSS. Keep stable IDs for measured roles rather than assuming a model-chosen class survives the next run. Record which markup and layout declarations the host supplied. This reduces the model's writable responsibility; it does not demonstrate independent design competence. Do not turn a screen-specific action row into a universal preset. Verify enlarged text again: a correct row can still hide its label with nowrap, ellipsis or a fixed height. Use wrapping and content-driven control height where the label must remain complete.

Each CSS unit needs the actual rendered element structure, including JavaScript-created children, exact attribute values, attribute owners and available custom properties. Supply complete CSS statements with nearby inheritance context. A tag-only shell omits dynamically rendered cards; a declaration cut midway omits valid existing source. Keep the writable unit explicit and its dependencies read-only.

For decorative illustrations, implement the frame's dimensions and positioning context first, then each shape variant using the exact rendered attribute value. Review the painted result as well as its box: a positive-size empty background is not a completed illustration, and absolute pseudo-elements can escape a zero-height owner. Test every variant in the assembled page. For forms, verify the actual font and weight of inputs, selects and placeholders separately from body text. A supplied font file alone does not establish control inheritance.

## Executable layout contract

Create `design/layout-contract.json` with a nonempty `rules` array. Each rule needs a unique `id` and `kind`. Selectors must identify exactly one visible element except `absent`, which requires no matching element. Optional `widths` and `states` restrict applicability and must not hide required coverage.

| Kind | Fields | Measured relationship |
| --- | --- | --- |
| contained | subject, container | DOM ownership and rendered containment |
| absent | subject | No duplicated or forbidden content in a region |
| below | subject, reference, minGap | Ordered regions with a minimum vertical gap |
| disjoint | subject, reference | Independent regions do not overlap |
| sameRow | subject, reference, tolerance | Horizontally separated regions have aligned vertical centers; tolerance defaults to 2px, maximum 8px |
| rowLimit | groups, maximum | Maximum semantic groups sharing a horizontal row |
| sampleWidth | subject, sample | Sample HTML and assembly have equal width and inset |

For example, a card contract can contain favorite ownership in identity, absence of body paragraphs in identity, body below identity, nonoverlapping price/action, and a row limit across price/action/favorite. Use the actual selectors and observed relationships of the target, not copied selectors from another service. The sample filename must be a local HTML file.

Both browser evaluation routes emit layout-contract evidence. Missing contracts and uncovered viewport/state scopes remain UNVERIFIED; a failed relation is FAIL. Test 1440, 390 and 320 pixel widths alongside existing long-text, 200% text and spacing checks. Preserve source and harness hashes. A contract added after generation is a diagnostic audit, not evidence of predeclared compliance.

Geometry cannot establish reference-level quality. Inspect font appearance, icon states, density, rhythm, copy and complete responsive composition against the reference directly. Assess every active rule in the 75-rule catalog and all eight guides with evidence. Missing visual, interaction or asset evidence remains unknown even when every layout relation passes.

## Resolve text sizing conflicts before generation

A reference measurement describes a default-size state. For buttons, headings and other text-bearing regions, translate the observed height into a minimum height with natural growth unless the product explicitly requires a bounded scroll region. Keep exact dimensions for genuinely fixed visual assets or icon-only targets when appropriate. Do not pass a fixed text height to the local model while also requiring enlarged text to remain visible. Resolve that contradiction in the component plan before generation and record the plan change; do not silently weaken the text-stress requirement.

Use unitless line-height for wrapping text so200% font enlargement does not leave the original pixel line-height behind. A text action needs normal wrapping, sufficient padding and automatic height. Preserve complete labels, type size and the ownership of adjacent actions. Inspect actual button text bounds as well as ancestor clipping: native controls can lose label content even with overflow:visible. Missing reused-component samples must be rebuilt from the unchanged assembled content and checked alongside newly split units.
