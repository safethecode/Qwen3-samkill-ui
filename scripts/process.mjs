import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';

export function run(exe, args, log, cwd, timeoutMs = 20 * 60 * 1000) {
  return new Promise((accept, reject) => {
    const sink = createWriteStream(log, { flags: 'wx' });
    const errors = createWriteStream(`${log}.stderr`, { flags: 'wx' });
    const child = spawn(exe, args, { cwd, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const timeout = setTimeout(() => child.kill(), timeoutMs);
    for (const stream of [sink, errors]) stream.on('error', error => { clearTimeout(timeout); child.kill(); sink.destroy(); errors.destroy(); reject(error); });
    child.stdout.on('data', b => { sink.write(b); process.stdout.write(b); });
    child.stderr.on('data', b => { errors.write(b); process.stderr.write(b); });
    child.on('error', error => { clearTimeout(timeout); sink.end(); errors.end(); reject(error); });
    child.on('close', code => { clearTimeout(timeout); sink.end(() => errors.end(() => accept(code))); });
  });
}
