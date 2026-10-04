# Predeclared local font integration

Overall status: **INCOMPLETE**. This is a fresh Round 02 generation, not a successful reference-parity trial.

The generator previously omitted `design/typography.json` from model input. It now passes the predeclared roles to every stage and includes the unchanged file in checkpoint binding. Tests cover input forwarding, invalid roles and rejection of resume after intent changes. The full suite passed 122 tests.

Before generation, this trial supplied official Noto Sans KR variable-font bytes, the upstream OFL license, pinned source URL and SHA-256 in [the font contract](round-02/source/design/typography.json). This is a deliberate font integration profile, not an assertion that Noto Sans KR exactly matches the reference. Font bytes and the contract participate in the published source binding.

## Fresh generation

Local Qwen3.6 35B A3B Coding completed generation and evaluation in 555 seconds. The first shell omitted a label; its retry added a label but assigned `visually-hidden`. Static lifecycle initialization and minimum typography normalization are host assistance. Raw model responses remain in [the evidence directory](round-02/evidence).

Original evaluation and fresh published-source revalidation both report **35/37**. Enlargement overflows the page at 390 and 320 pixels. These counts exclude unautomated requirements and must not be treated as visual approval. [Study](study.json), [revalidation](revalidation/report.json).

## Font loading failure hidden by the installed environment

The finished CSS names Noto Sans KR but never defines `@font-face`. Chromium reports Noto Sans KR with `isCustomFont: false`, and the web-font list is empty. The matching installed system font therefore satisfies the current family-name check without using the supplied file. **Local font delivery failed.** [Rendered-font evidence](revalidation/font-rendering-390.json).

This identifies a missing distinction in the current gate: intended family and intended delivery source are separate requirements. A system-font profile may legitimately use an installed family, but this trial explicitly required the supplied file. The result is manually rejected against that contract; no historical automated result has been rewritten.

## Direct rendered comparison

The [390-pixel output](revalidation/390.png) was inspected against the [supplied reference](round-02/source/assets/reference/source.png). The broad lavender canvas and white-card grouping remain, and official avatar/icon assets render. However, the visible search label is absent, category controls are faint, certification metadata moves into a separate row, the favorite action moves to the bottom, decorative separators were introduced, and the fee row contains only a label without a fee or consultation action. The [320-pixel enlarged output](revalidation/text-200-320.png) has substantial horizontal overflow from search and awkward narrow text wrapping.

The browser label check skips disabled fields, so its passing result does not establish this disabled search field's visible-label requirement. Full guide/catalog review, delayed and failed font-loading states, mobile device behavior and repeated representative generation remain incomplete.

## Bounded local-model follow-up

An operator-diagnosed prompt supplied the unchanged font intent and requested only its missing loading definition. Qwen added one `@font-face` rule in 46 seconds, using the exact local path, `100 900` weight range and `swap`. No layout or application code changed. This is assisted diagnosis followed by a model patch, not autonomous recovery. [Raw response](bounded-repair/evidence/repair-response.json).

The file now loads: `document.fonts` reports a loaded face, and Chromium reports custom-font glyphs. Its platform family name is `Noto Sans KR Thin`, matching the supplied upstream metadata's full name, while the CSS family and predeclared role are `Noto Sans KR`. The strict role-name check fails at all three viewports, reducing the count to **32/37**. Fresh published-source revalidation confirms this. The original combined `localFontLoaded` predicate remains false because it also required an exact family-name match; that raw result is preserved. [Revalidation study](bounded-repair/study.json), [upstream metadata](bounded-repair/source/assets/fonts/METADATA.pb).

The repaired [390-pixel capture](bounded-repair/revalidation/390.png) was inspected directly and retains the earlier layout defects. The loading path has measurably improved, but the repair is not approved overall. Future font preparation must derive platform aliases from the official file metadata before generation, bind those aliases to the actual font bytes, and distinguish system-font profiles from required-file profiles. Do not rewrite this trial's intent after observing its output or treat the word `Thin` as evidence that the browser ignored the variable weight axis.
