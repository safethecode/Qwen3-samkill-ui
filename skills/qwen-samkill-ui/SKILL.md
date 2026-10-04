---
name: qwen-samkill-ui
description: Use when a local Qwen model implements or reviews web UI, including samkill-ui tasks, reference-based designs, incomplete generated files, or unsupported completion claims.
---

# Qwen samkill-ui

Deliver working files, not a description of files. Follow the user's requirements and the project's AGENTS.md and DESIGN.md. Keep replies in the user's language.

## Execution

1. Read DESIGN.md and inspect existing files. If no design contract exists, write a short one covering layout, type, colors, interactions, responsive behavior and evidence. Use supplied references. Record unknowns instead of inventing observations.
   Before coding, identify five observable anchors: heading/action alignment, content column structure, dominant content component, spacing hierarchy and mobile stacking. Preserve these anchors during repairs. A reference's document preview, table or content panel is part of the product, not optional decoration. Words such as “clean” or “modern” are not a sufficient layout contract.
2. For reference-driven UI, first read [Decomposed layout](references/decomposed-layout.md). Split by semantic regions before splitting files: shared tokens, each element's owned content and actions, then assembly. Declare measurable ownership, spacing, row grouping and sample-width relationships in design/layout-contract.json before generation. Give the local model one element and its read-only neighbors at a time. Preserve the reference's information hierarchy; do not compress price, primary action and favorite into one row when they belong to different regions. Implement one complete file or bounded edit per tool call. Write HTML, then behavior, then CSS for the complete static and dynamic structure. For repairs, replace only the affected section instead of repeating the entire old and new file; aim for fewer than 100 changed lines per edit. Use real tool calls; never print XML tool calls. Inspect an errored or interrupted write before retrying. Do not stop after a plan, scaffolding, or the first file.
   For a fresh application, establish stable element IDs in HTML, implement behavior against those IDs, then style both the static and dynamically rendered elements. Verify the connections between files. If reference reading is denied, use the installed project-local reference and report the unavailable source instead of pretending it was read.
3. Run syntax/build checks. Run browser interaction tests and capture desktop/mobile screenshots. Fix failures and repeat the failed checks. A screenshot alone does not test interactions.
4. Review screenshots against the contract: hierarchy, document/content density, spacing, typography, reference fidelity and mobile layout. Record visual review as UNVERIFIED if images were not inspected. Automated tests cannot establish design quality.
5. Report actual files and executed checks. Never say all requirements are met when any gate is FAIL or UNVERIFIED. Persist remaining work in UI-STATUS.md before context exhaustion.

When QUALITY.json exists, read `.opencode/quality-runner.json` and execute its registered Node binary and script with the target directory and visual repair budget 4. The installer records these local runtime paths. Alternatively run `npm run quality -- TARGET 4` from the Qwen3-samkill-ui repository checkout. The target needs DESIGN.md and approved desktop/mobile references declared in QUALITY.json. Read QUALITY-RESULT.json and the process exit status. Functional-only iterate/evaluate success does not establish visual completion. Missing references or an unavailable runner leave visual quality UNVERIFIED; never substitute a self-written PASS. The quality runner owns its repair loop, so do not edit the target concurrently with it. A failed gate must not be bypassed by rewriting the manifest, relaxing its criteria or replacing the reference with the candidate.

## Non-negotiable UI rules

The short rules below do not replace the upstream guides. For implementation completion, assess every active ID in `references/upstream/reference-review/references/failure-catalog.json`, preserve each original check kind, and record scope, applicability, exceptions and actual evidence. Also record coverage of all eight linked guides; research or onboarding may be inapplicable only for a concrete project reason. A six-category visual score is not this review. Use the bundled design gate as described in `references/upstream/reference-review/references/design-gate.md`. Missing evidence stays unknown.

The repository runner creates `design/review-plan.json` as an inventory, not proof. `node scripts/catalog.mjs TARGET init` creates unknown review drafts. Complete `design/gate-contract.json` and `design/gate-report.json` from actual inspections, including the `PROJECT-GUIDE-*` entries. The quality command requires the catalog gate too. Do not stamp every rule pass or declare a whole guide inapplicable to finish sooner.

- Use semantic controls and persistent visible labels. Placeholder text is not a label.
- Default text is at least 14px and font weight at least 500; use the project's stricter rules. Set form controls to inherit typography.
- Define and reuse CSS design tokens. Respect the contract's spacing and colors.
- Do not invent logos, icons, reference URLs, analytics or screenshot observations. Use verified official or existing-system assets. Omit only optional icons; a required reference icon with no verified asset is unfinished, not permission to erase it or use emoji. The repository exports pinned official icons with `node scripts/icons.mjs TARGET Search X`; preserve their files, manifest, geometry and license. Check rendered paint, label, target, edge clicks, focus and state changes, not SVG attributes alone.
- Read the typography and icon-controls references before changing these components. Record intended rendered font families by role and selector in `design/typography.json`. Verify actual browser fonts, Korean/Latin/numeric fallback, loading and weight support; a CSS family string is insufficient. Test long text, 200% text and text spacing as applicable. Read the upstream guide for exceptions and platform limits; do not report unexecuted device checks as passed.
- No decorative separators, tab underlines, fake KPIs or unnecessary hero sections. Focus indication must remain visible; prefer an inset field ring. Honor reduced motion.
- Implement every requested state: empty, validation, saved, editing, errors and recovery. Keep create and edit identities separate; clear edit state when starting a new item. Render user content as text, not HTML.
- Seed examples only when saved storage is absent and mark them explicitly. Implement archive, restore and duplication only when required by this product contract: archive removes an active record, restore reverses it, and duplicates get independent IDs. Do not add document controls to unrelated services. A required visible label does not make its value mandatory.
- Persist timestamps as strings or numbers and convert them back before date formatting after reload. For document collections, sample documents need a visible 예시 badge on each Korean example card. Other products use the sample-data disclosure specified by their contract. Every preview and metadata interpolation must preserve user text without executing it; prefer textContent over assembling HTML strings.
- Respect explicit no-comments requirements in all generated code.
- Do not call MAU, analytics or unrelated task tools for a UI implementation request. A tool's availability does not make it relevant. If references are supplied, do not search again.

## Load references only when needed

Do not read all guides at once. Load the guide matching the current unresolved decision, then its relevant reference only.
These guides are reference documents, not additional installed skill names. Follow their file links with the read tool; do not assume the upstream names are registered as callable skills.

| Need | Guide |
| --- | --- |
| Reference selection | [UIBowl research](references/upstream/uibowl-research/guide.md) |
| Reference observations | [Decomposition](references/upstream/reference-decompose/guide.md) |
| Local element generation and layout gates | [Decomposed layout](references/decomposed-layout.md) |
| Design contract | [Design specification](references/upstream/design-md/guide.md) |
| Implementation | [Reference to UI](references/upstream/reference-to-ui/guide.md) |
| New service scope and bounded work | [Service-specific contracts](references/service-contracts.md) |
| Document collection previews | [Document collection hierarchy](references/document-collections.md) |
| Final comparison | [Review](references/upstream/reference-review/guide.md) |
| Interface copy | [UX copy](references/upstream/ux-copy/guide.md) |
| Onboarding | [Onboarding](references/upstream/onboarding-flow/guide.md) |

## Completion record

UI-STATUS.md must distinguish implemented features, executed checks with results, visual evidence and remaining failures. Do not rewrite FAIL as PASS because a retry was attempted. If a tool or browser is unavailable, state the exact blocked check and leave it UNVERIFIED.
