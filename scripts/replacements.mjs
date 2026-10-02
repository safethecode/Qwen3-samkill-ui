import { validateGeneratedFile } from './generate.mjs';
import { PatchError } from './patches.mjs';

export function applyFileReplacements(files, replacements) {
  if (!Array.isArray(replacements) || !replacements.length || replacements.length > 3) throw new PatchError('Expected 1–3 complete files');
  const next = { ...files };
  const seen = new Set();
  for (const replacement of replacements) {
    if (!replacement || !Object.hasOwn(files, replacement.path) || seen.has(replacement.path)) throw new PatchError('Invalid or duplicate replacement path');
    seen.add(replacement.path);
    try {
      next[replacement.path] = validateGeneratedFile(replacement.path, { done_reason: 'stop', message: { content: JSON.stringify(replacement) } });
    } catch (error) { throw new PatchError(`Invalid complete file ${replacement.path}: ${error.message}`); }
  }
  if (Object.keys(files).every(path => files[path] === next[path])) throw new PatchError('No-op file replacements');
  return next;
}
