import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { run } from '../scripts/process.mjs';

test('noninteractive children receive EOF and their output is retained', async () => {
  const target = await mkdtemp(resolve(tmpdir(), 'qwen-process-'));
  const log = resolve(target, 'output.log');
  const code = await run(process.execPath, ['-e', 'process.stdin.resume(); process.stdin.on("end", () => process.stdout.write("EOF received"))'], log, target, 5000);
  assert.equal(code, 0);
  assert.equal(await readFile(log, 'utf8'), 'EOF received');
});
