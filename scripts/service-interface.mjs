import { parse } from 'parse5';

export function validateShellLabels(html) {
  const fields = [];
  const labels = [];
  const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
  const labelText = node => {
    if (attr(node, 'hidden') !== undefined || /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attr(node, 'style') || '') || ['script', 'style', 'template', 'input', 'select', 'option', 'textarea', 'button'].includes(node.tagName)) return '';
    return node.nodeName === '#text' ? node.value : (node.childNodes || []).map(labelText).join('');
  };
  const visit = node => {
    if (node.tagName === 'label' && labelText(node).trim()) labels.push(node);
    if (['input', 'select', 'textarea'].includes(node.tagName) && !['hidden', 'submit', 'button', 'reset', 'image'].includes((attr(node, 'type') || '').toLowerCase())) fields.push(node);
    for (const child of node.childNodes || []) visit(child);
  };
  visit(parse(html));
  const errors = [];
  for (const field of fields) {
    const id = attr(field, 'id');
    const ancestors = [];
    for (let parent = field.parentNode; parent; parent = parent.parentNode) ancestors.push(parent);
    if (!labels.some(label => (id && attr(label, 'for') === id) || (attr(label, 'for') === undefined && ancestors.includes(label)))) errors.push(`Field ${id ? '#' + id : field.tagName} requires a nonempty visible label; a placeholder or aria-label alone is insufficient`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

export function validateInterface(html, required = {}) {
  const ids = new Map();
  const visit = node => {
    const id = node.attrs?.find(attr => attr.name === 'id')?.value;
    if (id) ids.set(id, [...(ids.get(id) || []), node.tagName]);
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parse(html));
  const errors = [];
  for (const [id, tag] of Object.entries(required)) {
    const found = ids.get(id) || [];
    if (found.length !== 1) errors.push(`Contract interface #${id} must occur exactly once as <${tag}>`);
    else if (tag !== '*' && found[0] !== tag) errors.push(`Contract interface #${id} must be <${tag}>, received <${found[0]}>`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
