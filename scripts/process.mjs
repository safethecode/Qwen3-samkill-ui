import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

export function run(exe, args, log, cwd, timeoutMs = 20 * 60 * 1000) {
  return new Promise((accept, reject) => {
    const sink = createWriteStream(log, { flags: 'wx' });
    const child = spawn(exe, args, { cwd, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const timeout = setTimeout(() => child.kill(), timeoutMs);
    sink.on('error', error => { clearTimeout(timeout); child.kill(); reject(error); });
    child.stdout.on('data', b => { sink.write(b); process.stdout.write(b); });
    child.stderr.on('data', b => process.stderr.write(b));
    child.on('error', error => { clearTimeout(timeout); sink.end(); reject(error); });
    child.on('close', code => { clearTimeout(timeout); sink.end(() => accept(code)); });
  });
}
