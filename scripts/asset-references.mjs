import { access, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { parse } from 'acorn';
import { parse as parseHTML } from 'parse5';

export async function validateAssetReferences(target, stage, code) {
  const references = new Set();
  if (stage.file === 'index.html') {
    const visit = node => {
      if (['img', 'source', 'video', 'audio'].includes(node.tagName)) for (const attribute of node.attrs || []) if (['src', 'poster'].includes(attribute.name)) references.add(attribute.value);
      for (const child of node.childNodes || []) visit(child);
    };
    visit(parseHTML(code));
  } else if (stage.file === 'styles.css') {
    for (const match of code.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) references.add(match[2]);
  } else if (stage.file === 'app.js') {
    const visit = node => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'Literal' && typeof node.value === 'string' && /^(?:\.?\/?assets\/|https?:\/\/).*\.(?:png|jpe?g|gif|webp|svg|avif|woff2?|ttf|otf)(?:[?#].*)?$/i.test(node.value)) references.add(node.value);
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === 'object' && value.type) visit(value);
      }
    };
    visit(parse(code, { ecmaVersion: 'latest', sourceType: 'script' }));
  }
  const root = await realpath(target);
  const missing = [];
  for (const source of references) {
    if (source.startsWith('data:') || source.startsWith('#')) continue;
    if (/^(?:https?:)?\/\//.test(source)) { missing.push(source); continue; }
    const path = resolve(root, source.split(/[?#]/)[0].replace(/^\//, ''));
    const actual = await realpath(path).catch(() => null);
    if (!actual || !actual.startsWith(root + sep) || !await access(actual).then(() => true, () => false)) missing.push(source);
  }
  if (missing.length) throw new Error(`Unprovided image/font assets: ${missing.join(', ')}. Use only supplied files; do not invent URLs or local font availability. Preserve required media with a real supplied asset or the explicitly requested CSS illustration.`);
}
