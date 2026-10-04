# Travel itinerary: resumed local generation

Status: INCOMPLETE_REFERENCE_QUALITY.

The previously interrupted input was resumed only after the competing inference ended and Ollama had no loaded models. Four semantic units completed on their first attempts in 42.8, 21.1, 45.9 and 19.1 seconds. The host supplied immutable HTML, shared assembly CSS, font loading, reference photo crops and official icons; the local model generated component CSS. This is an assisted static translation, not an independently implemented interactive product.

The live UI Bowl preview and retrieval record are in source/assets/reference. The photo crops come from the earlier inspected upstream round01 assets, not from a new crop of the live preview. Original CSS, font and hidden Day3 content remain unknown.

The initial browser evaluation was 34/40, failing the partial Day3 image's clipping checks. Direct inspection of the 390px and 320px renders exposed a larger problem: all three full photos were invisible because model CSS used clip-path inset with a 100% left inset. Positive image dimensions and successful loading did not catch this.

The later visibility-audit directory preserves a fresh source-bound evaluation under the expanded media gate: 31/40. It detects the three viewport-level hidden-image failures as well as the original six text-stress failures. The original revalidation directory remains unchanged. No visual approval is given.
