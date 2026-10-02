import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectCardText } from '../scripts/visibility.mjs';

test('sample text must be unoccluded and unclipped, while offscreen cards remain scrollable', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
    await page.setContent('<article style="position:relative"><span>예시</span><div style="position:absolute;inset:0;background:white;z-index:2">Cover</div><button>편집</button></article><article><div style="height:1px;overflow:hidden"><span>예시</span></div><button>편집</button></article><article style="margin-top:2000px"><span>예시</span><button>편집</button></article>');
    const before = await page.evaluate(() => scrollY);
    const cards = await inspectCardText(page, '예시');
    assert.deepEqual(cards.map(card => card.visible), [false, false, true]);
    assert.equal(cards[0].reason, 'occluded');
    assert.equal(cards[1].reason, 'clipped');
    assert.equal(await page.evaluate(() => scrollY), before);
  } finally { await browser.close(); }
});

test('painted overlays block badges regardless of pointer events, transparent overlays do not', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<article style="position:relative"><span>예시</span><div style="position:absolute;inset:0;background:white;pointer-events:none"></div><button>편집</button></article><article style="position:relative"><span>예시</span><div style="position:absolute;inset:0;background:transparent"></div><button>편집</button></article>');
    assert.deepEqual((await inspectCardText(page, '예시')).map(card => card.visible), [false, true]);
    assert.equal(await page.locator('style').count(), 0);
  } finally { await browser.close(); }
});
