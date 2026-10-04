import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareLocalFont, localFontCss } from '../scripts/local-font.mjs';
import { generateService } from '../scripts/generate-service.mjs';
import { inspectFontRendering } from '../scripts/font-rendering.mjs';
import { chromium } from 'playwright';

test('font preparation derives custom platform identity before generation and binds the supplied bytes', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-local-font-'));
  await mkdir(join(target, 'assets'));
  await cp('evals/results/font-intent-generation/round-02/source/assets/fonts/NotoSansKR.ttf', join(target, 'assets/font.ttf'));
  const options = { asset: 'assets/font.ttf', sha256: '194018e6b2b293a7964f037b25c0249ce1418bc9ab3c971060a03aa57861e252', family: 'Noto Sans KR', weight: '100 900' };
  await assert.rejects(prepareLocalFont(target, { ...options, sha256: '0'.repeat(64) }), /hash/);
  const intent = await prepareLocalFont(target, options);
  assert.deepEqual(intent.roles[0].families, ['Noto Sans KR Thin']);
  assert.equal(intent.roles[0].requireCustomFont, true);
  assert.match(await localFontCss(target, intent), /@font-face/);
  assert.match(await localFontCss(target, intent), /assets\/font.ttf/);
  assert.equal(JSON.parse(await readFile(join(target, 'design/typography.json'), 'utf8')).localFont.sha256, options.sha256);
  await assert.rejects(prepareLocalFont(target, options), /exist/i);
  await assert.rejects(localFontCss(target, { ...intent, localFont: { ...intent.localFont, sha256: '0'.repeat(64) } }), /hash/);
  await writeFile(join(target, 'DESIGN.md'), 'Use the prepared font.');
  await writeFile(join(target, 'REFERENCE.md'), 'Font integration test.');
  const evidence = join(target, 'evidence');
  await mkdir(evidence);
  const parts = { shell: '<html><body><p>한글 ABC</p></body></html>', state: 'let x=0;', behavior: 'x++;', forms: 'x++;', layout: 'body{font-family:"Noto Sans KR"}', responsive: 'p{font-size:14px}' };
  await generateService(target, evidence, { fetcher: async (_url, options) => {
    const stage = /CURRENT UNIT: (\w+)/.exec(JSON.parse(options.body).messages[1].content)[1];
    return { ok: true, json: async () => ({ done_reason: 'stop', message: { content: JSON.stringify({ code: parts[stage] }) } }) };
  } });
  assert.match(await readFile(join(target, 'styles.css'), 'utf8'), /^@font-face/);
  assert.equal(JSON.parse(await readFile(join(evidence, 'font-loading-assistance.json'), 'utf8')).status, 'APPLIED_NOT_APPROVED');
});

test('a matching system family cannot satisfy a file-delivery role', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<p style="font-family:Arial">ABC</p>');
    const initial = await inspectFontRendering(page);
    const families = [...new Set(initial.fonts.flatMap(item => item.fonts).map(font => font.familyName))];
    const report = await inspectFontRendering(page, { roles: [{ selector: 'p', families, requireCustomFont: true }] });
    assert.ok(report.issues.some(issue => issue.status === 'FAIL' && /system font/.test(issue.problem)));
  } finally { await browser.close(); }
});
