import { PatchError } from './patches.mjs';
import { parse } from 'acorn';

function sourceUnits(path, source) {
  const windows = (start, end) => {
    const result = [];
    for (let offset = start; offset < end; offset += 5000) result.push({ offset, content: source.slice(offset, Math.min(offset + 6000, end)), boundary: 'fragment' });
    return result;
  };
  if (path !== 'app.js') return windows(0, source.length);
  let nodes;
  try { nodes = parse(source, { ecmaVersion: 'latest', sourceType: 'script' }).body; }
  catch { return windows(0, source.length); }
  if (!nodes.length) return windows(0, source.length);
  const result = [];
  let start = null;
  let end = null;
  const flush = () => {
    if (start !== null) result.push({ offset: start, content: source.slice(start, end), boundary: 'complete-statements' });
    start = null;
  };
  for (const node of nodes) {
    if (start !== null && node.end - start > 6000) flush();
    if (node.end - node.start > 6000) { result.push(...windows(node.start, node.end)); continue; }
    start ??= node.start;
    end = node.end;
  }
  flush();
  return result;
}

export function selectRepairUnit(files, focus, detail, attempt = 0) {
  const terms = [...new Set((detail.toLowerCase().match(/[\p{L}\p{N}_-]{3,}/gu) || []).filter(t => !['the', 'and', 'with', 'this', 'that', 'should', 'must', 'visible'].includes(t)))];
  const units = [];
  for (const path of focus) {
    const source = files[path];
    for (const unit of sourceUnits(path, source)) {
      units.push({ path, ...unit, score: terms.reduce((n, word) => n + (unit.content.toLowerCase().includes(word) ? 1 : 0), 0) });
    }
  }
  if (!units.length) throw new PatchError('No repairable source units');
  units.sort((a, b) => b.score - a.score || focus.indexOf(a.path) - focus.indexOf(b.path) || a.offset - b.offset);
  const unit = units[attempt % units.length];
  const inventory = Object.entries(files).map(([path, content]) => `${path}: ${content.length} characters`).join('\n');
  const markup = (files['index.html']?.match(/<[^>]+>/g) || []).filter(tag => /\b(id|class|for|type)=/.test(tag)).join('\n').slice(0, 4000);
  const context = `SOURCE INVENTORY\n${inventory}\nREAD-ONLY HTML STRUCTURE (partial, not the entire DOM)\n${markup}\nWRITABLE EXACT SOURCE EXCERPT\nFILE: ${unit.path}\nOFFSET: ${unit.offset}\nBOUNDARY: ${unit.boundary}\n${unit.content}\nEND EXCERPT\nThis is a partial view of a complete file. Unseen code still exists. Complete-statements excerpts retain whole top-level statements. Fragment excerpts may end inside existing code: do not complete a cut identifier or append closing syntax; the rest already exists outside the excerpt. Only replace text present in this excerpt; do not rewrite the whole file or invent missing context. Return one small coherent patch. Other work is deferred to subsequent requests.`;
  return { ...unit, context, unitCount: units.length };
}

export function validateUnitPatches(unit, patches) {
  if (!Array.isArray(patches) || patches.length !== 1) throw new PatchError('A repair unit requires exactly one patch');
  const patch = patches[0];
  if (!patch || patch.path !== unit.path || typeof patch.oldString !== 'string' || !patch.oldString || !unit.content.includes(patch.oldString) || patch.oldString.length > 2000 || typeof patch.newString !== 'string' || patch.newString.length > 4000 || patch.oldString === patch.newString) throw new PatchError('Patch exceeds its selected source unit');
  return patches;
}
