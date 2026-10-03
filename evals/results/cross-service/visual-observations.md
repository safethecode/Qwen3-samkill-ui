# Direct screenshot observations

These are Codex observations of actual browser screenshots, not local vision-model scores. Functional checks do not establish visual parity. All candidates were generated locally; no product source was manually rewritten for the baseline.

## Original service: facilities dispatch

Inspected at 1440, 390 and 320 pixels. The candidate has an oversized navy header, default blue underlined navigation and an almost unstyled search input. Mobile keeps a compressed table instead of the requested stacked queue. At 320 pixels it shrinks text below the 14-pixel contract. The amber creation button competes with urgency colors. Derived counts are absent from the main screen. This is below the requested visual standard despite successful completion of all five generation units.

## Original service: learning room

Inspected at 1440 and 390 pixels. The initial page has no visible product title and shows an empty lesson panel while enabled completion and note controls remain present. Navigation is a tall nested bullet list; mobile content overflows horizontally and pushes the lesson below most of the first viewport. Three of the eight seeded lessons lack week metadata and do not appear in navigation. Search updates stored input but does not filter rendered lessons. The workflow evaluator was corrected to select a lesson explicitly before saving/completing it; absence of automatic selection alone is not scored as a functional failure.

## Round 01: itinerary

Compared reference and candidate at 390 pixels. The reference separates the checkbox from a photo/text/handle row and gives the bottom completion action a full-width region. The candidate uses broken photo URLs, omits that ownership structure visually, compresses metadata into faint small text, and presents a tiny completion button. Missing supplied photography explains the fidelity constraint but does not excuse shipping broken images. The candidate is below the reference structure and finish.

## Round 02: mentor discovery

Compared reference and candidate at 390 pixels and inspected the candidate at 1440. Lavender/white surfaces survive, but avatars are broken, the profile header collapses into a vertical text stack, and certification/employer metadata loses its separate color roles. The large search submission and filled favorite button compete with the mentor content. The desktop candidate expands the mobile card layout to a very wide page. Its original 14/15 functional/basic checks did not detect these visual defects; revised asset checks explicitly reject broken images. This is not a near-parity result.

## Round 03: health journal

Compared at 390 pixels. The candidate preserves a pale background and white panels, but the reference's compact shortcut grid becomes four vertically stacked buttons. The promotional region is literal placeholder copy, and the summary, challenge and records lose the reference's varied information density. The large heading and vertical gaps push lower content down. Emoji stand in for the requested controlled visual system. Basic readable panels alone are insufficient; this remains below the reference.

## Round 04: cafe booking

Compared main screens at 390 pixels and inspected the failed empty-booking screen. Reference media, condition chips and time actions are organized into clear sections. The candidate has broken photographs, mostly browser-default controls, text-only theme headings and a detached booking surface. More seriously, the initial page displays booking and confirmation content together. HTML/JavaScript use a `hidden` class, while CSS only styles the `[hidden]` attribute; the empty form therefore appears alongside a misleading completed-booking message. This is both a visible quality failure and a broken state presentation, not merely different artwork.

## Round 08: cooking

Compared initial screens at 390 pixels. The dark background and coral action survive, but the initial candidate is a mostly empty ingredient checklist with duplicate egg controls, rather than the reference's food-led composition. Its old 15/16 basic/workflow count plainly overstated visual readiness. The strict workflow fails on duplicate ingredient labels. For direct inspection only, Codex selected the first egg control and opened a recipe using its actual title button; this did not change the recorded failed workflow. The resulting cooking screen has an empty dark media rectangle and nearly white instruction text on a pale active-step background. Thus neither the main composition nor active-step readability meets the requested quality.

## Round 09: resume workspace and editor

Compared both the workspace and editor at 390 pixels. Creation, editing and persistence pass the scoped workflow, but list cards contain placeholder-like example names and short field summaries rather than readable paper previews inside a distinct stage. Every card action has the same heavy fill. The editor has readable labelled fields, yet creation remains the dominant header action while editing and save/cancel receive identical emphasis. The original has more features than the scoped contract; missing version history is not counted as a contract failure. The requested paper hierarchy and action priority are still missing.

## Input correction

Input correction: the baseline round-08 reference observation incorrectly described a pale active-step panel. Direct inspection of the actual upstream cooking state shows a dark neutral panel with large light text and quieter later steps. The baseline input is preserved for provenance; the fixture observation is corrected for subsequent runs. This weakens any literal panel-color comparison from the baseline. The candidate's unreadable active-step contrast and empty media remain directly observable defects.

## Pending comparisons

Workshop generation failed HTML interface validation before producing an application. The invitation candidate is still being generated; no verdict is assigned before inspecting its output.
