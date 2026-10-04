# Qwen3 Coder30B workshop comparison

Status: **BELOW TARGET**. Static host-scaffolded component CSS, no booking workflow or catalog approval.

qwen3-coder:30b completed all three units on their first attempts, using the same source inputs and2,048 output-token cap as the qwen3.6:35b-a3b-coding thinking-off baseline. Total reported request time was333,264 ms versus310,335 ms for the baseline. This single sequential run is not a reliable speed ranking; cache and model-loading state are not controlled.

Direct inspection of390px and320px with200% text found missing square image sizing, compressed metadata-to-description spacing, and a clipped booking label. The model produced only figure styling for media and did not size the actual img to the requested square. The reference-level quality criterion is not met.

A host-authored instruction conflict also contributed: the baseline booking prompt explicitly demanded height52px while shared requirements demanded enlargement support. Both models inherited that contradictory plan. The next experiment corrects it to minimum height plus automatic growth and repeats fresh generation without post-generation patches. This input defect must not be attributed solely to model capability.

The decomposition guide now requires resolving fixed text-height versus enlarged-text conflicts before generation. Follow-up runs also clarify image geometry and Korean word boundaries. Their outcome is pending and no improvement is claimed in this record.
