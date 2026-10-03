import { icons } from 'lucide';
import { readFile, mkdir, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

export const iconVersion = '1.51.0';
export const iconNodes = name => {
  if (!Object.hasOwn(icons, name) || !Array.isArray(icons[name])) throw new Error(`Unknown official Lucide icon: ${name}`);
  return icons[name];
};
const escape = value => String(value).replace(/[&"<>]/g, character => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' })[character]);
const digest = data => createHash('sha256').update(data).digest('hex');
export function iconMarkup(name) {
  const nodes = iconNodes(name).map(([tag, attributes]) => `<${tag} ${Object.entries(attributes).map(([key, value]) => `${key}="${escape(value)}"`).join(' ')}></${tag}>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" data-icon-source="lucide@${iconVersion}" data-icon-name="${name}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${nodes}</svg>`;
}
export async function writeIconAssets(target, names) {
  const records = [...new Set(names)].map(name => ({ name, svg: iconMarkup(name) }));
  const folder = resolve(target, 'assets/icons');
  const existing = await readdir(folder).catch(error => { if (error.code === 'ENOENT') return []; throw error; });
  if (existing.length) throw new Error('Icon destination is not empty; refusing to replace existing assets');
  await mkdir(folder, { recursive: true });
  const license = await readFile(new URL('../node_modules/lucide/LICENSE', import.meta.url), 'utf8');
  await writeFile(resolve(folder, 'LICENSE'), license);
  const manifest = { package: 'lucide', version: iconVersion, source: 'https://github.com/lucide-icons/lucide', licenseSha256: digest(license), icons: [] };
  for (const { name, svg } of records) {
    const file = `${name}.svg`;
    await writeFile(resolve(folder, file), svg, { flag: 'wx' });
    manifest.icons.push({ name, file, sha256: digest(svg), geometrySha256: digest(JSON.stringify(iconNodes(name))) });
  }
  await writeFile(resolve(folder, 'manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return manifest;
}

export async function verifiedIconAssets(target) {
  const folder = resolve(target, 'assets/icons');
  const manifest = await readFile(resolve(folder, 'manifest.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (!manifest) return {};
  if (manifest.package !== 'lucide' || manifest.version !== iconVersion || !Array.isArray(manifest.icons)) throw new Error('Unsupported icon manifest');
  const expectedLicense = await readFile(new URL('../node_modules/lucide/LICENSE', import.meta.url));
  if (digest(await readFile(resolve(folder, 'LICENSE'))) !== digest(expectedLicense) || manifest.licenseSha256 !== digest(expectedLicense)) throw new Error('Icon license integrity mismatch');
  const result = {};
  for (const icon of manifest.icons) {
    if (icon.file !== `${icon.name}.svg`) throw new Error('Invalid icon asset path');
    const data = await readFile(resolve(folder, icon.file));
    if (digest(data) !== icon.sha256 || icon.sha256 !== digest(iconMarkup(icon.name)) || icon.geometrySha256 !== digest(JSON.stringify(iconNodes(icon.name)))) throw new Error(`Official icon asset integrity mismatch: ${icon.name}`);
    result[`/assets/icons/${icon.file}`] = { name: icon.name, source: `lucide@${iconVersion}` };
  }
  return result;
}
