import { parse as parseJS } from 'acorn';
import { parse as parseHTML } from 'parse5';

export function validateDomReferences(html, script) {
  const available = new Set();
  const scanHTML = node => {
    const id = node.attrs?.find(attribute => attribute.name === 'id')?.value;
    if (id) available.add(id);
    for (const child of node.childNodes || []) scanHTML(child);
    if (node.content) scanHTML(node.content);
  };
  scanHTML(parseHTML(html));
  const references = new Set();
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'Literal' && typeof node.value === 'string' && /\bid\s*=/.test(node.value)) scanHTML(parseHTML(node.value));
    if (node.type === 'TemplateElement' && /\bid\s*=/.test(node.value.cooked || '')) scanHTML(parseHTML(node.value.cooked));
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === 'document') {
      const method = node.callee.property.name;
      const argument = node.arguments[0];
      if (argument?.type === 'Literal' && typeof argument.value === 'string') {
        if (method === 'getElementById') references.add(argument.value);
        if (['querySelector', 'querySelectorAll'].includes(method) && /^#[\w-]+$/.test(argument.value)) references.add(argument.value.slice(1));
      }
    }
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object' && value.type) visit(value);
    }
  };
  visit(parseJS(script, { ecmaVersion: 'latest', sourceType: 'script' }));
  const missing = [...references].filter(id => !available.has(id));
  if (missing.length) throw new Error(`JavaScript references IDs absent from the supplied HTML and literal rendered markup: ${missing.join(', ')}. Use the existing shell IDs; do not silently return when a required container is missing.`);
}
