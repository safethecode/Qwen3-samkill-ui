export class PatchError extends Error {}

export function applyPatches(files, patches) {
  if (!Array.isArray(patches) || patches.length < 1 || patches.length > 8) throw new PatchError('Expected 1–8 bounded patches');
  const contexts = patches.flatMap((patch, index) => {
    if (!patch || !Object.hasOwn(files, patch.path) || typeof patch.oldString !== 'string' || typeof patch.newString !== 'string' || !patch.oldString || patch.oldString === patch.newString) return [];
    const start = files[patch.path].indexOf(patch.oldString);
    if (start < 0 || files[patch.path].indexOf(patch.oldString, start + 1) >= 0) return [];
    return [{ ...patch, index, start, end: start + patch.oldString.length }];
  }).sort((a, b) => b.oldString.length - a.oldString.length || a.index - b.index);
  const redundant = new Set();
  for (const outer of contexts) {
    if (redundant.has(outer.index)) continue;
    for (const inner of contexts) {
      if (inner.index === outer.index || redundant.has(inner.index) || inner.path !== outer.path || inner.start < outer.start || inner.end > outer.end) continue;
      const offset = inner.start - outer.start;
      const result = outer.oldString.slice(0, offset) + inner.newString + outer.oldString.slice(offset + inner.oldString.length);
      if (result === outer.newString) redundant.add(inner.index);
    }
  }
  const next = { ...files };
  for (const patch of patches.filter((_, index) => !redundant.has(index))) {
    if (!patch || !Object.hasOwn(next, patch.path) || typeof patch.oldString !== 'string' || typeof patch.newString !== 'string') throw new PatchError('Invalid patch target or content');
    if (patch.oldString === patch.newString) throw new PatchError('No-op patch rejected: oldString equals newString');
    const source = next[patch.path];
    if (!patch.oldString) {
      if (source) throw new PatchError('Empty match is allowed only for an empty file');
      next[patch.path] = patch.newString;
      continue;
    }
    const first = source.indexOf(patch.oldString);
    if (first < 0) throw new PatchError(`No exact match in ${patch.path}. Copy oldString verbatim from the supplied current source, including whitespace.`);
    if (source.indexOf(patch.oldString, first + 1) !== -1) throw new PatchError(`Ambiguous match in ${patch.path}. Include enough surrounding lines to identify exactly one location.`);
    next[patch.path] = source.slice(0, first) + patch.newString + source.slice(first + patch.oldString.length);
  }
  return next;
}
