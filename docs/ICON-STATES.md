# Explicit icon asset states

External SVG images do not inherit their parent's text color into the SVG document. A CSS color on a button therefore cannot turn an outline image into a selected filled icon.

`appendIconVariant(target, { name, variant, fill, stroke })` in `scripts/icon-assets.mjs` exports a paint variant of the pinned official Lucide geometry. Initialize the target's icon directory with `writeIconAssets` first. Fill and stroke must be explicit six-digit hex colors or `none`; variant names use lowercase letters, digits and hyphens. Existing assets and duplicate variants cannot be replaced through this function.

The manifest records the chosen paint separately from the official geometry hash, asset hash and package/license provenance. Verification reconstructs the expected SVG and rejects altered geometry or paint. A variant is a project-chosen rendering of official geometry, not a claim that the reference used that library or exact color.

Give the local model the exact exported path and its intended state. Keep selected state semantics, visible paint and behavior consistent. Inspect the rendered result: provenance verification alone does not check contrast, visual match, target size, focus or click behavior. Disabled static samples do not demonstrate working favorites.
