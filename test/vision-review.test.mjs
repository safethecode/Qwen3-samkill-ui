import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { reviewViewport, loadQualityConfig } from '../scripts/vision-review.mjs';
import { criteria } from '../scripts/quality-policy.mjs';

test('vision review uses ordered images and no writer history; truncated or missing evidence fails closed', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'qwen-vision-'));
  const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
  await writeFile(join(dir, 'reference.png'), png);
  await writeFile(join(dir, 'current.png'), png);
  const content = { criteria: criteria.map(id => ({ id, score: 4, confidence: 0.9, observation: 'Both images show aligned, readable document content.' })), issues: [] };
  let request;
  let calls = 0;
  const fetcher = async (url, options) => {
    request = JSON.parse(options.body);
    calls++;
    const selected = request.format.properties.criteria.items.properties.id.enum;
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ ...content, criteria: content.criteria.filter(c => selected.includes(c.id)) }) } }) };
  };
  const options = { model: 'local-vision', endpoint: 'http://127.0.0.1:11434', reference: join(dir, 'reference.png'), current: join(dir, 'current.png'), viewport: 'mobile', contract: 'Resume UI', observations: 'Preserve paper previews.', audit: true, evidence: dir, fetcher };
  const result = await reviewViewport(options);
  assert.equal(calls, 3);
  assert.equal(request.options.num_predict, 1536);
  assert.equal(result.criteria.length, 6);
  assert.equal(request.messages.length, 2);
  assert.equal(request.messages[1].images.length, 2);
  assert.equal(request.messages[1].images[0], png.toString('base64'));
  assert.match(request.messages[0].content, /independent/);
  assert.match(request.messages[1].content, /adversarial/i);
  assert.ok(result.referenceHash && result.currentHash);
  await assert.rejects(reviewViewport({ ...options, fetcher: async () => ({ ok: true, json: async () => ({ done_reason: 'length', message: { content: JSON.stringify(content) } }) }) }), /Truncated/);
  await assert.rejects(reviewViewport({ ...options, current: join(dir, 'missing.png') }), /ENOENT/);
  await writeFile(join(dir, 'QUALITY.json'), JSON.stringify({ version: 1, references: { desktop: 'reference.png' }, observations: 'Use the supplied hierarchy.' }));
  await assert.rejects(loadQualityConfig(join(dir, 'QUALITY.json')), /mobile/);
});
