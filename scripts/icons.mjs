import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { writeIconAssets, iconMarkup } from './icon-assets.mjs';

const [directory, ...names] = process.argv.slice(2);
if (!directory || !names.length) throw new Error('Usage: node scripts/icons.mjs TARGET Search ChevronLeft X');
const manifest = await writeIconAssets(resolve(directory), names);
await writeFile(resolve(directory, 'assets/icons/inline.json'), JSON.stringify(Object.fromEntries(names.map(name => [name, iconMarkup(name)])), null, 2), { flag: 'wx' });
console.log(JSON.stringify(manifest, null, 2));
