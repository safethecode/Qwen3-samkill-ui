import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { countComments } from './comments.mjs';
import { checkDesign } from './design-checks.mjs';
import { chooseFilter } from './controls.mjs';
import { inspectTypography } from './typography-check.mjs';

const root = await realpath(resolve(process.argv[2] || 'runs/resume'));
const output = resolve(process.argv[3] || 'runs/evidence');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
await mkdir(output, { recursive: true });
const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push({ name, status: 'PASS' }); }
  catch (error) { results.push({ name, status: 'FAIL', detail: error.message.slice(0, 1400) }); }
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const file = await realpath(resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'))));
    if (!file.startsWith(root + sep)) throw new Error('Outside fixture');
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  for (const file of ['index.html', 'styles.css', 'app.js']) {
    await check(`file:${file}`, async () => assert((await readFile(resolve(root, file))).length > 0, 'Missing or empty file'));
  }
  await check('javascript-syntax', async () => assert(spawnSync(process.execPath, ['--check', resolve(root, 'app.js')]).status === 0, 'JavaScript syntax error'));
  browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
  page.setDefaultTimeout(2500);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.dismiss());
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.screenshot({ path: resolve(output, 'desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.screenshot({ path: resolve(output, 'mobile.png'), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const button = name => page.getByRole('button', { name, exact: true });
  await check('three-example-documents', async () => {
    const count = await button('편집').count();
    const labeled = (await page.locator('body').innerText()).includes('예시');
    assert(count === 3 && labeled, `Fresh storage must show 3 active example documents in 전체 with an example label; observed ${count} edit buttons and example label=${labeled}. All three initial examples must be non-archived.`);
  });
  await check('search-label-and-empty-state', async () => {
    const search = page.getByRole('textbox', { name: '이력서 검색', exact: true });
    assert(await search.evaluate(e => [...(e.labels || [])].some(label => label.getBoundingClientRect().width > 0)), 'Search needs a visible label');
    await search.fill('no-match-fixture-932');
    assert(await button('편집').count() === 0, 'Search did not filter documents');
    assert(/없|찾|결과/.test(await page.locator('body').innerText()), 'No empty-state message');
    await search.fill('');
  });
  await check('visible-labels-and-create', async () => {
    await button('새 이력서').click();
    for (const [label, value] of Object.entries({ 제목: '검증 이력서', 이름: '테스트', 직무: '개발자', 이메일: 'test@example.com', 소개: '검증용 소개' })) {
      const field = page.getByLabel(new RegExp(`^${label}\\s*\\*?$`));
      assert(await field.isVisible(), `Clicking 새 이력서 did not reveal the editor field ${label}; inspect its click handler and hidden state`);
      assert(await field.evaluate(e => [...(e.labels || [])].some(label => label.getBoundingClientRect().width > 0)), `Missing visible label: ${label}`);
      await field.fill(value);
    }
    await button('저장').click();
    const formState = await page.locator('form').first().evaluate(form => ({ dataset: { ...form.dataset }, invalidFields: [...form.elements].filter(e => e.validity && !e.validity.valid).map(e => e.id || e.name) }));
    assert((await page.locator('body').innerText()).includes('검증 이력서'), `Saved document is not visible. Browser form state: ${JSON.stringify(formState)}. Inspect create-versus-edit branching in the submit handler.`);
  });
  await page.reload();
  await check('reload-persistence', async () => assert((await page.locator('body').innerText()).includes('검증 이력서'), 'Saved document lost after reload'));
  await check('duplicate', async () => {
    const count = await button('편집').count();
    await button('편집').first().click();
    const original = {};
    for (const label of ['제목', '이름', '직무', '이메일', '소개']) original[label] = await page.getByLabel(new RegExp(`^${label}\\s*\\*?$`)).inputValue();
    await button('취소').click();
    await button('복제').first().click();
    assert(await button('편집').count() === count + 1, 'Duplicate did not create a document');
    const matches = [];
    for (let index = 0; index < count + 1; index++) {
      await button('편집').nth(index).click();
      const values = {};
      for (const label of Object.keys(original)) values[label] = await page.getByLabel(new RegExp(`^${label}\\s*\\*?$`)).inputValue();
      if (['이름', '직무', '이메일', '소개'].every(label => values[label] === original[label])) matches.push(index);
      await button('취소').click();
    }
    assert(matches.length >= 2, 'Duplicate did not preserve document fields');
    await button('편집').nth(matches.at(-1)).click();
    await page.getByLabel(/^이름\s*\*?$/).fill('독립 복제 검증');
    await button('저장').click();
    await page.reload();
    let unchanged = 0;
    let modified = 0;
    for (let index = 0; index < await button('편집').count(); index++) {
      await button('편집').nth(index).click();
      const name = await page.getByLabel(/^이름\s*\*?$/).inputValue();
      unchanged += Number(name === original['이름']);
      modified += Number(name === '독립 복제 검증');
      await button('취소').click();
    }
    assert(unchanged >= 1 && modified === 1, 'Editing the duplicate also changed its source');
  });
  await check('archive-and-restore', async () => {
    const count = await button('편집').count();
    await button('보관').first().click();
    assert(await button('편집').count() === count - 1, 'Archived item remains in active list');
    await chooseFilter(page, '보관함');
    await page.getByRole('button', { name: /^(복원|보관 해제|보관해제)$/ }).first().click();
    await chooseFilter(page, '전체');
    assert(await button('편집').count() === count, 'Restore lost a document');
  });
  await check('create-after-edit', async () => {
    await chooseFilter(page, '전체');
    const count = await button('편집').count();
    await button('편집').first().click();
    await button('취소').click();
    await button('새 이력서').click();
    for (const [label, value] of Object.entries({ 제목: '편집 후 신규', 이름: '테스트', 직무: '개발자', 이메일: 'test@example.com' })) await page.getByLabel(new RegExp(`^${label}\\s*\\*?$`)).fill(value);
    await button('저장').click();
    const formState = await page.locator('form').first().evaluate(form => ({ dataset: { ...form.dataset }, invalidFields: [...form.elements].filter(e => e.validity && !e.validity.valid).map(e => e.id || e.name) }));
    assert(await button('편집').count() === count + 1, `After canceling edit and starting new, no document was added. Introduction is optional. Browser form state: ${JSON.stringify(formState)}. Check HTML required attributes and submit/edit logic.`);
  });
  await page.reload();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await check(`overflow-${width}`, async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow'));
    await check(`typography-${width}`, async () => {
      const bad = await inspectTypography(page);
      await button('새 이력서').click();
      bad.push(...await inspectTypography(page));
      await page.reload();
      assert(!bad.length, `Every visible text element needs font-size >=14px AND font-weight >=500. Actual computed styles: ${JSON.stringify(bad.slice(0, 8))}`);
    });
    await page.screenshot({ path: resolve(output, `result-${width}.png`), fullPage: true });
  }
  await check('runtime-errors', async () => assert(!errors.length, errors.join('; ')));
  await check('no-code-comments', async () => {
    const files = await Promise.all(['index.html', 'styles.css', 'app.js'].map(file => readFile(resolve(root, file), 'utf8')));
    const counts = countComments(...files);
    assert(Object.values(counts).every(n => n === 0), `Remove code comments without altering strings or behavior: ${JSON.stringify(counts)}`);
  });
  await check('required-title-validation', async () => {
    await page.reload();
    await button('새 이력서').click();
    const title = page.getByLabel(/^제목\s*\*?$/);
    await title.fill('');
    await button('저장').click();
    assert(await title.isVisible(), 'Empty title was accepted');
    const body = await page.locator('body').innerText();
    const message = await title.evaluate(e => e.validationMessage);
    assert(/제목.{0,25}(입력|필수)/.test(body) || /[가-힣]/.test(message), 'Show a Korean title-required error');
  });
  await check('user-content-is-text', async () => {
    await page.reload();
    await button('새 이력서').click();
    const payload = '검증 <img src=x onerror="window.__injected=1">';
    for (const [label, value] of Object.entries({ 제목: payload, 이름: '테스트', 직무: '개발자', 이메일: 'test@example.com', 소개: '안전한 텍스트' })) await page.getByLabel(new RegExp(`^${label}\\s*\\*?$`)).fill(value);
    await button('저장').click();
    assert(await page.locator('img[src="x"]').count() === 0 && (await page.locator('body').innerText()).includes(payload), 'Render user-entered strings as text, not executable HTML');
  });
  if (process.env.QWEN_DESIGN_CHECKS === '1') {
    const designPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'ko-KR' });
    designPage.setDefaultTimeout(2500);
    designPage.on('dialog', dialog => dialog.dismiss());
    await designPage.goto(`http://127.0.0.1:${server.address().port}`);
    await checkDesign(designPage, check, process.env.QWEN_EVAL_VARIANT === '1');
  }
} finally {
  await browser?.close();
  await new Promise(r => server.close(r));
}
const report = { fixture: 'resume', checksVersion: 6, designChecks: process.env.QWEN_DESIGN_CHECKS === '1', results, passed: results.filter(r => r.status === 'PASS').length, total: results.length, visualReview: 'UNVERIFIED', limitations: ['This fixture does not certify general UI quality, comprehensive security, all validation states or reference fidelity.'] };
await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.passed === report.total ? 0 : 1;
