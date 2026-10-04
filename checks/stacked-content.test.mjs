import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectStackedButtons } from '../scripts/stacked-content.mjs';

test('explicit mobile stacking rejects a horizontal carousel and missing buttons, but accepts wrapping vertical groups', async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    await page.setContent('<style>nav{display:flex;overflow:auto}section{min-width:220px}button{display:block}</style><nav><section><button>First lesson</button></section><section><button>Second lesson</button></section></nav>');
    const names = ['First lesson', 'Second lesson'];
    assert.ok((await inspectStackedButtons(page, names)).issues.length > 0);
    await page.addStyleTag({ content: 'nav{flex-direction:column}section{min-width:0}' });
    assert.deepEqual((await inspectStackedButtons(page, names)).issues, []);
    await page.getByRole('button', { name: names[1] }).evaluate(e => e.remove());
    assert.ok((await inspectStackedButtons(page, names)).issues.some(issue => issue.problem === 'Required button is missing or ambiguous'));
  } finally { await browser.close(); }
});
