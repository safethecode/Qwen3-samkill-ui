import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { withRollback } from '../scripts/transaction.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

test('a failed repair process restores the previously accepted source', async () => {
  const target = await mkdtemp(resolve(tmpdir(), 'qwen-rollback-'));
  await writeFile(resolve(target, 'app.js'), 'const original = true;');
  await assert.rejects(withRollback(target, { 'app.js': 'const original = true;' }, async () => {
    await promisify(execFile)(process.execPath, ['-e', 'require("node:fs").writeFileSync("app.js", "broken candidate"); process.exit(1);'], { cwd: target, windowsHide: true });
  }), error => error.code === 1);
  assert.equal(await readFile(resolve(target, 'app.js'), 'utf8'), 'const original = true;');
});
