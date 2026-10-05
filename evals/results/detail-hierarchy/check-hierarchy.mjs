import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { sourceBinding } from '../../../scripts/source-binding.mjs';
import { harnessBinding } from '../../../scripts/harness-binding.mjs';
import { inspectLayoutContract } from '../../../scripts/layout-contract.mjs';
import { inspectTextStress } from '../../../scripts/text-stress.mjs';
import assert from 'node:assert/strict';
const [root, evidence, contractPath] = process.argv.slice(2);
await mkdir(evidence, { recursive: true });
const sourceHashes = await sourceBinding(root);
const contractText = await readFile(contractPath || resolve(root, 'design/layout-contract.json'), 'utf8');
const contract = JSON.parse(contractText);
const server = createServer(async (req, res) => {
  try {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!sourceHashes[name]) throw Error('Missing asset');
    res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' })[extname(name)] || 'application/octet-stream');
    res.end(await readFile(resolve(root, name)));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
const results = [];
const url = `http://127.0.0.1:${server.address().port}`;
try {
  for (const width of [296, 320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.setDefaultTimeout(3000);
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    const report = { width, states: {}, checks: [] };
    const check = async (name, fn) => { try { await fn(); report.checks.push({ name, status: 'PASS' }); } catch (e) { report.checks.push({ name, status: 'FAIL', detail: e.message.slice(0, 300) }); } };
    const capture = async state => {
      report.states[state] = await inspectLayoutContract(page, contract, { state });
      await page.screenshot({ path: `${evidence}/${state}-${width}.png`, fullPage: true });
    };
    await capture('initial');
    await check('direct-entry return and list-detail-return navigation', async () => {
      await page.locator('#back').click();
      assert.equal(new URL(page.url()).pathname, '/classes.html');
      assert.equal(await page.locator('h1').innerText(), '공예 수업');
      await page.locator('.class-link').click();
      assert.equal(await page.locator('#book').isVisible(), true);
      await page.locator('#back').click();
      assert.equal(await page.locator('.class-link').count(), 1);
      await page.locator('.class-link').click();
    });
    await page.goto(url);
    await page.locator('#book').click();
    await capture('form');
    await check('all three time options retained before and after input', async () => {
      const slots = () => page.locator('#slot').evaluate(e => [...e.options].map(o => o.value));
      const expected = ['', '10:00', '14:00', '18:00'];
      assert.deepEqual(await slots(), expected);
      await page.locator('#guest').fill('테스트 사용자');
      await page.locator('#date').fill('2027-05-15');
      assert.deepEqual(await slots(), expected);
    });
    await page.locator('#guest').fill('테스트 사용자');
    await page.locator('#date').fill('2027-05-15');
    await page.locator('#slot').selectOption('14:00');
    await page.locator('.confirm-booking').click();
    if (!await page.locator('#booking-dialog').isVisible()) await page.locator('#book').click();
    await capture('success');
    await check('completion title is primary and stale product summary is hidden', async () => {
      assert.equal(await page.locator('#booking-title').innerText(), '예약이 완료되었어요');
      assert.equal(await page.locator('#booking-product').isVisible(), false);
      assert.equal(await page.locator('#booking-form').isVisible(), false);
      const summary = await page.locator('#confirmation-details').innerText();
      for (const text of ['첫 번째 도자기 잔', '테스트 사용자', '2027-05-15', '14:00', '55,000원']) assert.ok(summary.includes(text));
      assert.equal(await page.locator('#booking-dialog h2:visible,#booking-dialog h3:visible').count(), 1);
    });
    report.successStress = await inspectTextStress(page, async mode => { await page.screenshot({ path: `${evidence}/success-${width}-${mode}.png`, fullPage: true }); });
    results.push(report);
    await page.close();
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }
const report = { status: 'UNVERIFIED_VISUAL_PARITY', sourceHashes, harnessHashes: await harnessBinding(), contractSha256: createHash('sha256').update(contractText).digest('hex'), captureSha256: createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'), results };
await writeFile(`${evidence}/report.json`, JSON.stringify(report, null, 2));
console.log(results.map(r => ({ width: r.width, failedRelations: Object.values(r.states).flatMap(s => s.results).filter(s => s.status === 'FAIL').length, checks: r.checks })));
