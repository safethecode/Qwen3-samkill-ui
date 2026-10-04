import { readFile, readdir, lstat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
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
  for (const name of ['index.html', 'styles.css', 'app.js', 'DESIGN.md', 'REFERENCE.md', 'assets', 'design/typography.json', 'design/component-plan.json', 'design/layout-contract.json']) await visit(name);
  const discover = async directory => {
    for (const entry of await readdir(resolve(target, directory), { withFileTypes: true })) {
      const name = directory ? `${directory}/${entry.name}` : entry.name;
      if (/^(?:\.git|node_modules|design|assets|quality-[^/]*|repair-[^/]*|run-[^/]*)(?:\/|$)/.test(name)) continue;
      if (entry.isSymbolicLink()) throw new Error(`Review source must not be a symlink: ${name}`);
      if (entry.isDirectory()) await discover(name);
      else if (/^\.(?:html?|css|[cm]?js|json|woff2?|ttf|otf|svg|png|jpe?g|webp|gif|avif|ico|mp4|webm|mp3|wav)$/.test(extname(name).toLowerCase()) && !['QUALITY-RESULT.json', 'QUALITY.json'].includes(name)) await visit(name);
    }
  };
  await discover('');
  return files;
}
