import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';

export function inferenceFetch(url, options) {
  if (!options.signal) throw new Error('Inference requests require an explicit cancellation signal');
  const protocol = new URL(url).protocol;
  if (!['http:', 'https:'].includes(protocol)) throw new Error('Unsupported inference URL protocol');
  return new Promise((resolve, reject) => {
    const request = (protocol === 'https:' ? httpsRequest : httpRequest)(url, { method: options.method, headers: options.headers, signal: options.signal }, response => {
      const chunks = [];
      let size = 0;
      response.on('data', chunk => {
        size += chunk.length;
        if (size > 32 * 1024 * 1024) { request.destroy(new Error('Inference response exceeds 32 MiB')); return; }
        chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ ok: response.statusCode >= 200 && response.statusCode < 300, status: response.statusCode, json: async () => JSON.parse(body) });
      });
    });
    request.on('error', error => reject(options.signal.aborted ? options.signal.reason : error));
    request.end(options.body);
  });
}

export function inferenceTimeout(defaultMs = 600000, env = process.env) {
  const value = env.QWEN_REQUEST_TIMEOUT_MS === undefined ? defaultMs : Number(env.QWEN_REQUEST_TIMEOUT_MS);
  if (!Number.isInteger(value) || value < 1000 || value > 1800000) throw new Error('Invalid QWEN_REQUEST_TIMEOUT_MS: expected 1000..1800000 milliseconds');
  return value;
}
