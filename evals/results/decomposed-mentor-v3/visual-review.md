# Semantic component trial, third attempt

Status: INCOMPLETE. No reference-level or commercial-quality approval.

Seven elements completed sequentially. Search and two card bodies used predeclared fixed semantic HTML with model-generated CSS. Shared CSS, assembly templates, font loading and selector scoping were host supplied. This is a static prototype, not a completed interactive service.

The original bound browser run passed 34/37 checks. All 21 element/viewport sample comparisons matched the assembled width and inset. The first card's badge is 12px and fails the minimum at all three widths. See [study](study.json), [geometry](sample-geometry.json) and [report](revalidation/report.json).

Direct inspection of [390px](revalidation/390.png) and [320px](revalidation/320.png) shows favorites separated into identity areas, with price and consultation below the description. The search label is visible. However, the first identity element invented an additional description, increasing card height and duplicating body ownership. The selected favorite still renders as a black outline; header icons are too strong; chip borders/shadows and inconsistent consultation surfaces remain. These differences prevent reference parity.

The later [layout audit](../decomposed-mentor-layout-audit/README.md) adds explicit relationships after generation and reruns with an expanded harness. It catches the duplicated description at every width. Its 34/40 count must not be presented as a regression or improvement over this differently scoped 34/37 run. Original generation evidence is retained unchanged.
