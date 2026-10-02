import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { chooseFilter } from '../scripts/controls.mjs';

test('filter checks operate both button and select implementations', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<button onclick="document.body.dataset.filter=\'archive\'">보관함</button>');
    await chooseFilter(page, '보관함');
    assert.equal(await page.locator('body').getAttribute('data-filter'), 'archive');
    await page.setContent('<label>필터<select onchange="document.body.dataset.filter=this.value"><option value="all">전체</option><option value="archive">보관함</option></select></label>');
    await chooseFilter(page, '보관함');
    assert.equal(await page.locator('body').getAttribute('data-filter'), 'archive');
    await chooseFilter(page, '전체');
    assert.equal(await page.locator('body').getAttribute('data-filter'), 'all');
  } finally { await browser.close(); }
});
