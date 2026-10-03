import { parse } from 'parse5';

export function validateInterface(html, required = {}) {
  const ids = new Map();
  const visit = node => {
    const id = node.attrs?.find(attr => attr.name === 'id')?.value;
    if (id) ids.set(id, [...(ids.get(id) || []), node.tagName]);
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parse(html));
  for (const [id, tag] of Object.entries(required)) {
    const found = ids.get(id) || [];
    if (found.length !== 1) throw new Error(`Contract interface #${id} must occur exactly once as <${tag}>`);
    if (tag !== '*' && found[0] !== tag) throw new Error(`Contract interface #${id} must be <${tag}>, received <${found[0]}>`);
  }
}
