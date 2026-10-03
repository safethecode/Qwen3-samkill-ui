import { readFile, readdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

export async function sourceBinding(target) {
  const files = {};
  const visit = async name => {
    const path = resolve(target, name);
    const stat = await lstat(path).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    if (!stat) return;
    if (stat.isSymbolicLink()) throw new Error(`Review source must not be a symlink: ${name}`);
    if (stat.isDirectory()) {
      for (const child of (await readdir(path)).sort()) await visit(`${name}/${child}`);
    } else if (stat.isFile()) files[name] = createHash('sha256').update(await readFile(path)).digest('hex');
  };
  for (const name of ['index.html', 'styles.css', 'app.js', 'DESIGN.md', 'REFERENCE.md', 'assets', 'design/typography.json']) await visit(name);
  return files;
}
