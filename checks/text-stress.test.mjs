import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectTextStress } from '../scripts/text-stress.mjs';

test('text stress exposes narrow layout overflow without compounding inherited sizes or changing source styles', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.setContent('<style>body{margin:0;font:500 16px sans-serif}.row{display:flex}.label{white-space:nowrap}button{font:inherit}</style><div class="row"><span class="label" style="color:black">Long search label</span><button>Search now</button></div>');
    const before = await page.locator('.label').getAttribute('style');
    const observed = [];
    const reports = await inspectTextStress(page, async mode => observed.push([mode, await page.locator('.label').evaluate(e => getComputedStyle(e).fontSize)]));
    assert.ok(reports.find(r => r.mode === 'text-200').overflowPx > 0);
    assert.deepEqual(observed, [['text-200', '32px'], ['text-spacing', '16px']]);
    assert.equal(await page.locator('.label').getAttribute('style'), before);
    assert.equal(await page.locator('.label').evaluate(e => getComputedStyle(e).fontSize), '16px');
    assert.equal(await page.locator('[style*="font-size"]').count(), 0);
    const masking = await page.addStyleTag({ content: '.row{overflow:hidden;max-width:100%}' });
    const masked = (await inspectTextStress(page)).find(r => r.mode === 'text-200');
    assert.equal(masked.overflowPx, 0);
    assert.ok(masked.clippedByAncestor.length > 0);
    await masking.evaluate(e => e.remove());
    await page.addStyleTag({ content: '.row{flex-wrap:wrap}.label{white-space:normal;overflow-wrap:anywhere}button{max-width:100%}' });
    assert.ok((await inspectTextStress(page)).every(r => r.overflowPx === 0 && r.clippedByAncestor.length === 0));
  } finally { await browser.close(); }
});
