import postcss from 'postcss';

export function normalizeTypography(css) {
  const root = postcss.parse(css);
  const tokens = new Map();
  root.walkDecls(declaration => {
    if (declaration.prop.startsWith('--')) tokens.set(declaration.prop, [...(tokens.get(declaration.prop) || []), declaration]);
  });
  const references = value => [...value.matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]);
  const protectedTokens = new Set();
  root.walkDecls(declaration => {
    if (!declaration.prop.startsWith('--') && !['font-weight', 'font-size'].includes(declaration.prop)) for (const token of references(declaration.value)) protectedTokens.add(token);
  });
  for (const token of protectedTokens) for (const declaration of tokens.get(token) || []) for (const dependency of references(declaration.value)) protectedTokens.add(dependency);
  const clamp = (declaration, kind, seen = new Set()) => {
    if (seen.has(declaration)) return;
    seen.add(declaration);
    const token = declaration.value.match(/^var\((--[\w-]+)\)$/)?.[1];
    if (token) {
      const targets = tokens.get(token) || [];
      if (protectedTokens.has(token)) {
        const values = targets.map(target => kind === 'font-size' && /^\d+(\.\d+)?px$/.test(target.value) ? parseFloat(target.value) : kind === 'font-weight' && (target.value === 'normal' || /^\d+$/.test(target.value)) ? target.value === 'normal' ? 400 : Number(target.value) : NaN);
        const minimum = kind === 'font-size' ? 14 : 500;
        if (values.length && values.every(value => Number.isFinite(value) && value < minimum)) declaration.value = kind === 'font-size' ? '14px' : '500';
        return;
      }
      for (const target of targets) clamp(target, kind, seen);
      return;
    }
    if (kind === 'font-weight' && (declaration.value === 'normal' || /^\d+$/.test(declaration.value) && Number(declaration.value) < 500)) declaration.value = '500';
    if (kind === 'font-size' && /^\d+(\.\d+)?px$/.test(declaration.value) && parseFloat(declaration.value) < 14) declaration.value = '14px';
  };
  root.walkDecls(declaration => { if (['font-weight', 'font-size'].includes(declaration.prop)) clamp(declaration, declaration.prop); });
  let body = root.nodes.find(node => node.type === 'rule' && node.selector === 'body');
  if (!body) { body = postcss.rule({ selector: 'body' }); root.prepend(body); }
  if (!body.nodes.some(node => node.prop === 'font-weight')) body.append({ prop: 'font-weight', value: '500' });
  if (!body.nodes.some(node => node.prop === 'font-size')) body.append({ prop: 'font-size', value: '16px' });
  const selector = 'button, input, select, textarea';
  if (!root.nodes.some(node => node.type === 'rule' && node.selector === selector && node.nodes.some(declaration => declaration.prop === 'font' && declaration.value === 'inherit'))) {
    const controls = postcss.rule({ selector });
    controls.append({ prop: 'font', value: 'inherit' });
    root.prepend(controls);
  }
  return root.toString();
}
