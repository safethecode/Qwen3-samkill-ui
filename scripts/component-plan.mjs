import { parseFragment } from 'parse5';
import postcss from 'postcss';
import { validateShellLabels } from './service-interface.mjs';

const slots = template => [...template.matchAll(/\{\{([A-Za-z0-9_-]+)\}\}/g)].map(match => match[1]);

export function scopeComponentCss(element, html, source) {
  const root = parseFragment(html).childNodes.find(node => node.tagName);
  const classes = (root?.attrs?.find(attr => attr.name === 'class')?.value || '').split(/\s+/).filter(Boolean);
  const id = root?.attrs?.find(attr => attr.name === 'id')?.value;
  const own = new Set([...classes.map(name => `.${name}`), ...(id ? [`#${id}`] : [])]);
  const prefix = `[data-ui-unit="${element.id}"]`;
  const css = postcss.parse(source);
  css.walkRules(rule => {
    rule.selectors = rule.selectors.map(selector => {
      if (/^(?:html\b|body\b|:root\b)/i.test(selector) || /[+~]/.test(selector)) throw new Error('Component CSS cannot target document scope or sibling escapes');
      if (selector.startsWith(prefix)) return selector;
      if (root?.tagName && new RegExp(`^${root.tagName}(?=[\\s.#:[>]|$)`).test(selector)) return `${prefix}${selector.slice(root.tagName.length)}`;
      const first = /^[.#][\w-]+/.exec(selector)?.[0];
      return own.has(first) ? `${prefix}${selector}` : `${prefix} ${selector}`;
    });
  });
  return css.toString();
}

export function validateComponentPlan(plan) {
  if (!plan || typeof plan.shared !== 'string' || typeof plan.sharedCss !== 'string' || typeof plan.assembly !== 'string' || plan.reference?.status !== 'inspected' || !Array.isArray(plan.elements) || !plan.elements.length || plan.elements.length > 12) throw new Error('Incomplete inspected component plan');
  const ids = plan.elements.map(element => element.id);
  if (ids.some(id => !/^[A-Za-z][\w-]*$/.test(id)) || new Set(ids).size !== ids.length) throw new Error('Invalid component IDs');
  const assemblySlots = slots(plan.assembly);
  if (assemblySlots.length !== ids.length || ids.some(id => assemblySlots.filter(slot => slot === id).length !== 1)) throw new Error('Every element needs exactly one assembly slot');
  for (const element of plan.elements) {
    if (typeof element.prompt !== 'string' || !element.prompt.trim() || !Array.isArray(element.assets) || element.assets.some(asset => typeof asset !== 'string') || typeof element.sample !== 'string' || slots(element.sample).join() !== element.id) throw new Error('Each component requires a prompt, assets and its own sample slot');
    if (element.html !== undefined) validateComponent(element, { html: element.html, css: `[data-ui-unit="${element.id}"]{min-width:0}` });
  }
  postcss.parse(plan.sharedCss);
  return plan;
}

export function validateComponent(element, result) {
  if (!result || typeof result.html !== 'string' || typeof result.css !== 'string' || !result.html.trim() || !result.css.trim() || result.html.length + result.css.length > 16000) throw new Error('Return bounded HTML and CSS for one component');
  const fragment = parseFragment(result.html);
  const nodes = fragment.childNodes.filter(node => node.nodeName !== '#text' || node.value.trim());
  if (nodes.length !== 1 || nodes[0].attrs?.find(attr => attr.name === 'data-ui-unit')?.value !== element.id) throw new Error(`Use one root with data-ui-unit="${element.id}"`);
  const visit = node => {
    if (node.tagName === 'svg') throw new Error('Use the supplied official asset as img src; do not redraw inline SVG');
    if (['script', 'style', 'link', 'iframe', 'object', 'embed'].includes(node.tagName) || node.attrs?.some(attr => /^on/i.test(attr.name) || attr.name === 'style' || /^javascript:/i.test(attr.value))) throw new Error('No active content or inline styling in static components');
    for (const attr of node.attrs || []) if (['src', 'poster', 'srcset'].includes(attr.name) && !element.assets.includes(attr.value)) throw new Error('Undeclared component asset');
    for (const child of node.childNodes || []) visit(child);
  };
  visit(fragment);
  validateShellLabels(result.html);
  const css = postcss.parse(result.css);
  const prefix = `[data-ui-unit="${element.id}"]`;
  css.walkRules(rule => {
    if (rule.selectors.some(selector => !selector.startsWith(prefix) || /[+~]/.test(selector))) throw new Error(`CSS scope must begin with ${prefix} and cannot escape through sibling selectors`);
  });
  css.walkAtRules(rule => { if (!['media', 'supports'].includes(rule.name)) throw new Error('Only media/supports at-rules are allowed within a component scope'); });
  css.walkDecls(declaration => {
    for (const match of declaration.value.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) if (!element.assets.includes(match[1])) throw new Error('Undeclared CSS asset');
  });
  return result;
}

export function assembleComponents(plan, completed) {
  validateComponentPlan(plan);
  for (const element of plan.elements) {
    if (!completed[element.id]) throw new Error(`Missing component ${element.id}`);
    validateComponent(element, completed[element.id]);
  }
  const fill = template => template.replace(/\{\{([A-Za-z0-9_-]+)\}\}/g, (_, id) => completed[id].html);
  return { html: fill(plan.assembly), css: `${plan.sharedCss}\n${plan.elements.map(element => completed[element.id].css).join('\n')}`, samples: Object.fromEntries(plan.elements.map(element => [element.id, fill(element.sample)])) };
}
