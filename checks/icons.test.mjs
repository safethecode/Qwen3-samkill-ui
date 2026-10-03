import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { iconMarkup, writeIconAssets, verifiedIconAssets } from '../scripts/icon-assets.mjs';
import { inspectIcons } from '../scripts/icon-check.mjs';
import { mkdtemp, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

test('official icon geometry and names are checked rather than trusting source labels', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent(`<button aria-label="검색">${iconMarkup('Search')}</button>`);
    assert.deepEqual((await inspectIcons(page)).issues, []);
    await page.locator('button').evaluate(button => button.style.cssText = 'width:18px;height:18px;padding:0');
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.problem.includes('24px')));
    await page.locator('button').evaluate(button => button.removeAttribute('style'));
    await page.addStyleTag({ content: 'svg{stroke:none;stroke-width:0}' });
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.problem.includes('paint')));
    await page.locator('style').evaluate(style => style.remove());
    await page.locator('path').evaluate(path => path.setAttribute('d', 'M0 0L24 24'));
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.problem.includes('geometry')));
    await page.setContent(`<button>${iconMarkup('Search')}</button>`);
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.problem.includes('accessible')));
    await page.setContent('<svg width="24" height="24"><path d="M0 0L24 24"/></svg>');
    assert.equal((await inspectIcons(page)).issues[0].status, 'UNVERIFIED');
    await page.setContent('<button>🩸 혈당</button>');
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.problem.includes('Emoji')));
  } finally { await browser.close(); }
});

test('exported official image assets are accepted only with verified local provenance', async () => {
  const target = await mkdtemp(join(tmpdir(), 'qwen-icon-browser-'));
  await writeIconAssets(target, ['Search']);
  const verifiedImages = await verifiedIconAssets(target);
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.route('http://icons.test/**', async route => {
      if (route.request().url().endsWith('.svg')) return route.fulfill({ contentType: 'image/svg+xml', body: await readFile(join(target, 'assets/icons/Search.svg')) });
      await route.fulfill({ contentType: 'text/html', body: '<button aria-label="검색"><img src="assets/icons/Search.svg" alt="" width="24" height="24"></button>' });
    });
    await page.goto('http://icons.test/');
    assert.ok((await inspectIcons(page)).issues.some(issue => issue.status === 'UNVERIFIED'));
    assert.deepEqual((await inspectIcons(page, { verifiedImages })).issues, []);
  } finally { await browser.close(); }
});
