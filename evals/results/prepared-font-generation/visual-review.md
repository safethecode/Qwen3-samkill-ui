# Prepared font generation

Status: **INCOMPLETE**. This is a font delivery experiment, not reference-level visual quality.

Before inference, an isolated Chromium probe read the official local TTF bytes and recorded its platform family as `Noto Sans KR Thin`. The generated contract keeps CSS family `Noto Sans KR` separate and requires custom-font rendering. The runner verifies the file SHA-256 and supplies the loading definition as explicit host assistance. The earlier font-intent trial and its contract remain unchanged.

Fresh local generation and published-source revalidation both scored **30/37**. Actual file loading and platform-family identity now agree at 1440/390/320. Contrast, narrow layout and enlargement failures remain. This run is not an overall improvement over the previous screen and is not approved. [Study](study.json), [font evidence](revalidation/font-rendering-390.json), [host assistance](round-02/evidence/font-loading-assistance.json).

The [390-pixel screenshot](revalidation/390.png) was directly inspected against the same upstream reference. It still hides the search label, puts name and role on one row, separates metadata from that identity group, places favorites in the footer, adds separators and uses large faded consultation buttons. The broad surface colors do not compensate for the incorrect reference anatomy. The user explicitly rejected this level of quality and asked for semantic decomposition rather than splitting only HTML/JavaScript/CSS tasks.

The next experiment therefore implements fixed reference elements separately and assembles the same outputs into a screen. Passing the font delivery checks remains a prerequisite only. Full guide/catalog review and reference-level design remain unfinished.
