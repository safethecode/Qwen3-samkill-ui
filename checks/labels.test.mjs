import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { hasVisibleLabel, inspectFieldLabels } from '../scripts/label-check.mjs';

test('field values and hidden text cannot substitute for a visible label', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<label><select id="bad"><option>10:00</option></select></label><label><span hidden>Name</span><input id="hidden"></label><label>예약 시간<select id="good"><option>10:00</option></select></label>');
    assert.equal(await page.locator('#bad').evaluate(hasVisibleLabel), false);
    assert.equal(await page.locator('#hidden').evaluate(hasVisibleLabel), false);
    assert.equal(await page.locator('#good').evaluate(hasVisibleLabel), true);
  } finally { await browser.close(); }
});

test('disabled fields still need a visible label and clipped text is not visible', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<label for="bad" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">Search</label><input id="bad" disabled><label for="good">Name</label><input id="good" disabled>');
    assert.equal(await page.locator('#bad').evaluate(hasVisibleLabel), false);
    assert.deepEqual(await inspectFieldLabels(page), ['bad']);
  } finally { await browser.close(); }
});
