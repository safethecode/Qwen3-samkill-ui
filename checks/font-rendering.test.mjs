import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectFontRendering } from '../scripts/font-rendering.mjs';

test('rendered fonts and contrast expose fallback, invisible text and uncertain surfaces', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage();
    await page.setContent('<style>body{background:#fff;font:500 16px sans-serif;color:#111}#bad{color:#fff}#gradient{background:linear-gradient(white,black)}</style><p id="good">Readable text</p><p id="bad">Invisible text</p><p id="gradient">Uncertain contrast</p>');
    const report = await inspectFontRendering(page);
    assert.ok(report.fonts.some(item => item.fonts.some(font => font.glyphCount > 0 && font.familyName)));
    assert.ok(report.issues.some(item => item.id === 'bad' && item.status === 'FAIL'));
    assert.ok(report.issues.some(item => item.id === 'gradient' && item.status === 'UNVERIFIED'));
    assert.ok(!report.issues.some(item => item.id === 'good'));
    const expected = await inspectFontRendering(page, { requiredFamilies: ['DefinitelyMissingFont'] });
    assert.ok(expected.issues.some(item => item.problem.includes('DefinitelyMissingFont')));
    const roles = await inspectFontRendering(page, { roles: [{ selector: '#good', families: ['DefinitelyMissingFont'] }] });
    assert.ok(roles.issues.some(item => item.selector === '#good' && item.problem.includes('fallback')));
  } finally { await browser.close(); }
});
