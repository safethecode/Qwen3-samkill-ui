import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function withRollback(target, before, action) {
  try { return await action(); }
  catch (error) {
    if (before) for (const [name, content] of Object.entries(before)) await writeFile(resolve(target, name), content);
    throw error;
  }
}
