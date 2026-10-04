import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { inspectLayoutContract } from '../scripts/layout-contract.mjs';
import { createServer } from 'node:http';

test('sample width gate checks assembled width and inset against the actual sample', async () => {
  let sampleWidth = 210;
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<div id="unit" style="width:${request.url === '/sample.html' ? sampleWidth : 200}px;height:40px">Unit</div>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
    const contract = { rules: [{ id: 'sample', kind: 'sampleWidth', subject: '#unit', sample: 'sample.html' }] };
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'FAIL');
    sampleWidth = 200;
    assert.equal((await inspectLayoutContract(page, contract)).results[0].status, 'PASS');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});

test('layout contracts reject misplaced actions, crowded rows and duplicate owned content', async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
    const contract = { rules: [
      { id: 'favorite-owner', kind: 'contained', subject: '#favorite', container: '#identity' },
      { id: 'body-owner', kind: 'absent', subject: '#identity p' },
      { id: 'action-density', kind: 'rowLimit', groups: ['#price', '#consult', '#favorite'], maximum: 2 },
      { id: 'body-after-identity', kind: 'below', subject: '#body', reference: '#identity', minGap: 8 }
    ] };
    await page.setContent('<div id="identity">Name<p style="margin:0">Duplicated description</p></div><div id="body">Body</div><footer style="display:flex"><span id="price">Price</span><button id="consult">Consult</button><button id="favorite">Favorite</button></footer>');
    const failed = await inspectLayoutContract(page, contract);
    assert.deepEqual(failed.results.filter(item => item.status === 'FAIL').map(item => item.id), contract.rules.map(item => item.id));
    await page.setContent('<div id="identity">Name<button id="favorite">Favorite</button></div><div id="body" style="margin-top:12px">Body</div><footer style="display:flex"><span id="price">Price</span><button id="consult">Consult</button></footer>');
    assert.ok((await inspectLayoutContract(page, contract)).results.every(item => item.status === 'PASS'));
    assert.equal((await inspectLayoutContract(page, null)).issues[0].status, 'UNVERIFIED');
    assert.ok((await inspectLayoutContract(page, { rules: [{ id: 'missing', kind: 'contained', subject: '#missing', container: '#identity' }] })).issues.some(item => item.status === 'FAIL'));
  } finally { await browser.close(); }
});
