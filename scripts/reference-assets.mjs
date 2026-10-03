import { readdir, realpath, lstat, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

export async function prepareReferenceAssets(target, fixture, referenceRoot) {
  if (!referenceRoot || !fixture.entry) return null;
  const root = await realpath(referenceRoot);
  const entry = await realpath(resolve(root, fixture.entry));
  if (!entry.startsWith(root + sep)) throw new Error('Reference entry is outside the supplied root');
  const source = resolve(dirname(entry), 'assets');
  const manifest = { referenceEntry: fixture.entry, source: 'User-supplied upstream checkout', provenance: 'Copied existing reference assets; source licensing and intended roles remain part of the catalog review.', files: [] };
  const visit = async folder => {
    const entries = await readdir(folder, { withFileTypes: true }).catch(error => { if (error.code === 'ENOENT' && folder === source) return []; throw error; });
    for (const item of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const path = resolve(folder, item.name);
      if ((await lstat(path)).isSymbolicLink()) throw new Error('Reference assets must not contain symlinks');
      if (item.isDirectory()) { await visit(path); continue; }
      if (!/\.(png|jpe?g|webp|avif|gif|svg|woff2?|ttf|otf)$/i.test(item.name) && !/^(LICENSE|COPYING|NOTICE)(\.|$)/i.test(item.name)) continue;
      const data = await readFile(path);
      const local = `assets/reference/${relative(source, path).split(sep).join('/')}`;
      const destination = resolve(target, local);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, data, { flag: 'wx' });
      manifest.files.push({ path: local, sha256: createHash('sha256').update(data).digest('hex') });
    }
  };
  await visit(source);
  await mkdir(resolve(target, 'assets'), { recursive: true });
  await writeFile(resolve(target, 'assets/reference-manifest.json'), JSON.stringify(manifest, null, 2), { flag: 'wx' });
  return manifest;
}
