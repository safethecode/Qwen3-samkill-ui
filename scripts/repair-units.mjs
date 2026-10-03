import { PatchError } from './patches.mjs';

export function selectRepairUnit(files, focus, detail, attempt = 0) {
  const terms = [...new Set((detail.toLowerCase().match(/[\p{L}\p{N}_-]{3,}/gu) || []).filter(t => !['the', 'and', 'with', 'this', 'that', 'should', 'must', 'visible'].includes(t)))];
  const units = [];
  for (const path of focus) {
    const source = files[path];
    for (let offset = 0; offset < source.length; offset += 5000) {
      const content = source.slice(offset, offset + 6000);
      units.push({ path, offset, content, score: terms.reduce((n, word) => n + (content.toLowerCase().includes(word) ? 1 : 0), 0) });
    }
  }
  if (!units.length) throw new PatchError('No repairable source units');
  units.sort((a, b) => b.score - a.score || focus.indexOf(a.path) - focus.indexOf(b.path) || a.offset - b.offset);
  const unit = units[attempt % units.length];
  const inventory = Object.entries(files).map(([path, content]) => `${path}: ${content.length} characters`).join('\n');
  const markup = (files['index.html']?.match(/<[^>]+>/g) || []).filter(tag => /\b(id|class|for|type)=/.test(tag)).join('\n').slice(0, 4000);
  const context = `SOURCE INVENTORY\n${inventory}\nREAD-ONLY HTML STRUCTURE (partial, not the entire DOM)\n${markup}\nWRITABLE EXACT SOURCE EXCERPT\nFILE: ${unit.path}\nOFFSET: ${unit.offset}\n${unit.content}\nEND EXCERPT\nThis is a partial source window. Unseen code still exists. Only replace text present in this excerpt; do not rewrite the whole file or invent missing context. Return one small coherent patch. Other work is deferred to subsequent requests.`;
  return { ...unit, context, unitCount: units.length };
}

export function validateUnitPatches(unit, patches) {
  if (!Array.isArray(patches) || patches.length !== 1) throw new PatchError('A repair unit requires exactly one patch');
  const patch = patches[0];
  if (!patch || patch.path !== unit.path || typeof patch.oldString !== 'string' || !patch.oldString || !unit.content.includes(patch.oldString) || patch.oldString.length > 2000 || typeof patch.newString !== 'string' || patch.newString.length > 4000 || patch.oldString === patch.newString) throw new PatchError('Patch exceeds its selected source unit');
  return patches;
}
