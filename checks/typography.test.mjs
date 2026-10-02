import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectTypography } from '../scripts/typography-check.mjs';
import { normalizeTypography } from '../scripts/typography.mjs';

test('typography inspects control values and placeholders and preserves large buttons', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const css = 'body{font:500 16px sans-serif}button{font-size:24px;font-weight:700}input{font-size:12px;font-weight:400}input::placeholder{font-size:11px;font-weight:400}';
    await page.setContent(`<style>${css}</style><input id="name" placeholder="Name"><button>Save</button><div hidden><input id="hidden"></div>`);
    const bad = await inspectTypography(page);
    assert.equal(bad.length, 2);
    assert.ok(bad.every(item => item.id === 'name'));
    assert.ok(bad.some(item => item.pseudo === '::placeholder'));
    await page.locator('style').evaluate((style, value) => { style.textContent = value; }, normalizeTypography(css));
    assert.deepEqual(await inspectTypography(page), []);
    assert.deepEqual(await page.locator('button').evaluate(element => [getComputedStyle(element).fontSize, getComputedStyle(element).fontWeight]), ['24px', '700']);
  } finally { await browser.close(); }
});
