import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { resolve, sep, extname, relative } from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { inspectTypography } from './typography-check.mjs';
import { inspectIcons } from './icon-check.mjs';
import { inspectFontRendering } from './font-rendering.mjs';
import { verifiedIconAssets } from './icon-assets.mjs';
import { reviewFindings } from './review-findings.mjs';
import { sourceBinding } from './source-binding.mjs';
import { inspectFieldLabels } from './label-check.mjs';
import { inspectWorkflowState } from './workflow-state.mjs';

export async function evaluateService(target, evidence, fixture, options = {}) {
  await mkdir(evidence, { recursive: true });
  const root = await realpath(target);
  const servedFiles = await sourceBinding(root);
  const unboundRequests = new Set();
  const server = createServer(async (req, res) => {
    try {
      const path = await realpath(resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'))));
      if (!path.startsWith(root + sep)) throw new Error('Outside root');
      const name = relative(root, path).split(sep).join('/');
      if (!servedFiles[name]) { unboundRequests.add(name); throw new Error('Unbound review dependency'); }
      res.setHeader('content-type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp' })[extname(path)] || 'application/octet-stream');
      res.end(await readFile(path));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  let browser;
  const checks = [];
  const measurements = {};
  const contentInventory = {};
  const reviewRequired = [];
  let iconAssets = {};
  const typographyContract = await readFile(resolve(target, 'design/typography.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return { roles: [] }; throw error; });
  let iconAssetError;
  try { iconAssets = await verifiedIconAssets(target); } catch (error) { iconAssetError = error.message; }
  const check = async (name, fn) => {
    try { await fn(); checks.push({ name, status: 'PASS' }); }
    catch (error) { checks.push({ name, status: 'FAIL', detail: error.message.slice(0, 1600), ...(error.observed ? { observed: error.observed } : {}) }); }
  };
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    const url = `http://127.0.0.1:${server.address().port}/${options.entry || 'index.html'}`;
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'ko-KR' });
      page.setDefaultTimeout(3000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('dialog', dialog => dialog.dismiss());
      const response = await page.goto(url);
      if (!response?.ok()) throw new Error(`Page did not load successfully: HTTP ${response?.status()}`);
      if (!await page.locator('body').innerText().then(text => text.trim().length > 0)) throw new Error('Page body is empty');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: resolve(evidence, `${width}.png`) });
      await page.screenshot({ path: resolve(evidence, `${width}-full.png`), fullPage: true });
      if (options.captureStates) await options.captureStates(page, width, evidence, url);
      if (!options.reference) {
        contentInventory[width] = await page.evaluate(() => {
          const inventory = {};
          for (const element of document.querySelectorAll('body *')) {
            if (!element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
            for (const node of element.childNodes) {
              if (node.nodeType !== 3) continue;
              const text = node.textContent.replace(/\s+/g, ' ').trim();
              if (text) inventory[text] = (inventory[text] || 0) + 1;
            }
          }
          return inventory;
        });
        await check(`content-${width}`, async () => {
          for (const text of fixture.anchors) {
            const candidates = await page.getByText(text, { exact: false }).all();
            assert.ok((await Promise.all(candidates.map(candidate => candidate.isVisible()))).some(Boolean), `Missing visible anchor: ${text}`);
          }
        });
        await check(`overflow-${width}`, async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Horizontal page overflow'));
        await check(`readable-${width}`, async () => {
          const issues = await inspectTypography(page);
          measurements[`readable-${width}`] = issues.length;
          assert.deepEqual(issues, [], 'Typography violates the local skill: visible text, controls and placeholders require at least 14px and weight 500');
        });
        await check(`font-rendering-${width}`, async () => {
          const report = await inspectFontRendering(page, { roles: typographyContract.roles, requiredFamilies: fixture.requiredFamilies || [] });
          await writeFile(resolve(evidence, `font-rendering-${width}.json`), JSON.stringify(report, null, 2));
          measurements[`font-rendering-${width}`] = report.issues.filter(issue => issue.status === 'FAIL').length;
          reviewRequired.push(...reviewFindings(report.issues, `font-rendering-${width}.json`, 'fonts'));
          assert.deepEqual(report.issues.filter(issue => issue.status === 'FAIL'), [], 'Actual fonts or solid-background text contrast require correction');
        });
        await check(`runtime-${width}`, async () => assert.deepEqual(errors, []));
        await check(`assets-${width}`, async () => {
          const broken = await page.locator('img').evaluateAll(images => images.filter(image => image.getBoundingClientRect().width && image.getBoundingClientRect().height && (!image.complete || !image.naturalWidth)).map(image => image.getAttribute('src')));
          measurements[`assets-${width}`] = broken.length;
          assert.deepEqual(broken, [], 'Visible images failed to load');
        });
        await check(`icons-${width}`, async () => {
          assert.equal(iconAssetError, undefined, iconAssetError);
          const icons = await inspectIcons(page, { verifiedImages: iconAssets });
          await writeFile(resolve(evidence, `icons-${width}.json`), JSON.stringify(icons, null, 2));
          measurements[`icons-${width}`] = icons.issues.filter(issue => issue.status === 'FAIL').length;
          reviewRequired.push(...reviewFindings(icons.issues, `icons-${width}.json`, 'icons'));
          assert.deepEqual(icons.issues.filter(issue => issue.status === 'FAIL'), [], 'Icon geometry or control semantics failed');
        });
        await check(`labels-${width}`, async () => {
          const unlabeled = await inspectFieldLabels(page);
          measurements[`labels-${width}`] = unlabeled.length;
          assert.deepEqual(unlabeled, [], 'Visible fields require visible labels; aria-label and placeholders alone are insufficient');
        });
      }
      await page.close();
    }
    if (!options.reference && fixture.flow !== 'static') {
      const exercise = async (name, fn) => check(name, async () => {
        const page = await browser.newPage({ viewport: { width: 390, height: 900 }, locale: 'ko-KR' });
        page.setDefaultTimeout(3000);
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('dialog', d => d.dismiss());
        try {
          await page.goto(url);
          await fn(page);
          assert.deepEqual(errors, []);
          await page.screenshot({ path: resolve(evidence, `${name}.png`), fullPage: true });
          const typography = await inspectTypography(page);
          const fonts = await inspectFontRendering(page, { roles: typographyContract.roles, requiredFamilies: fixture.requiredFamilies || [] });
          const icons = await inspectIcons(page, { verifiedImages: iconAssets });
          await writeFile(resolve(evidence, `${name}-presentation.json`), JSON.stringify({ typography, fonts, icons }, null, 2));
          reviewRequired.push(...reviewFindings(fonts.issues, `${name}-presentation.json`, 'fonts'), ...reviewFindings(icons.issues, `${name}-presentation.json`, 'icons'));
          assert.deepEqual({ typography, fonts: fonts.issues.filter(issue => issue.status === 'FAIL'), icons: icons.issues.filter(issue => issue.status === 'FAIL') }, { typography: [], fonts: [], icons: [] }, 'Workflow end state fails typography, font contrast or icon checks');
        }
        catch (error) {
          error.observed = await inspectWorkflowState(page).catch(() => undefined);
          if (error.observed) await writeFile(resolve(evidence, `${name}-failure-state.json`), JSON.stringify(error.observed, null, 2));
          await page.screenshot({ path: resolve(evidence, `${name}-failed.png`), fullPage: true }).catch(() => {});
          throw error;
        }
        finally { await page.close(); }
      });
      const button = (page, name) => page.getByRole('button', { name, exact: true });
      if (['booking', 'dispatch', 'document', 'learning'].includes(fixture.flow)) await exercise('search-empty-recovery', async page => {
        const resultAction = fixture.flow === 'document' ? button(page, '편집') : fixture.flow === 'learning' ? page.getByRole('button', { name: /의미 있는 HTML/ }) : button(page, '상세');
        const initialCount = await resultAction.count();
        assert.ok(initialCount > 0, 'No initial searchable results');
        const before = new Set((await page.locator('body').innerText()).split('\n').map(text => text.trim()));
        await page.locator('#search').fill('찾을수없는항목xyz');
        assert.equal(await resultAction.count(), 0, 'Search did not remove unmatched results');
        const added = (await page.locator('body').innerText()).split('\n').map(text => text.trim()).filter(text => !before.has(text)).join('\n');
        assert.match(added, /없|찾지|일치.*않/, 'No new visible no-results message');
        await page.locator('#search').fill('');
        assert.equal(await resultAction.count(), initialCount, 'Clearing search did not restore results');
      });
      if (fixture.flow === 'booking') {
        const open = async page => {
          assert.equal(await page.locator('#booking-form').isVisible(), false, 'Initial catalogue must not display the booking form');
          for (const action of await button(page, '예약하기').all()) assert.equal(await action.isVisible(), false, 'The detail action must reveal its booking action; an initially visible button cannot prove a detail transition');
          const before = (await page.locator('body').innerText()).split('\n').map(text => text.trim()).filter(Boolean);
          const title = await button(page, '상세').first().evaluate(action => {
            for (let parent = action.parentElement; parent && parent.tagName !== 'BODY'; parent = parent.parentElement) {
              const headings = [...parent.querySelectorAll('h2,h3,h4')];
              if (headings.length === 1) return headings[0].textContent.trim();
            }
            return '';
          });
          await button(page, '상세').first().click();
          assert.equal(await page.locator('#booking-form').isVisible(), false, 'Detail must precede the booking form; implement the actual detail view and its 예약하기 action');
          const action = button(page, '예약하기').first();
          await action.waitFor({ state: 'visible' });
          const detailText = await action.evaluate(element => element.closest('section,article,dialog,[role=dialog]')?.innerText || '');
          assert.ok(title && detailText.includes(title), 'The booking action must belong to a detail region identifying the selected item');
          const after = (await page.locator('body').innerText()).split('\n').map(text => text.trim()).filter(Boolean);
          for (const line of before) { const index = after.indexOf(line); if (index >= 0) after.splice(index, 1); }
          assert.ok(after.some(text => text !== '예약하기' && detailText.includes(text)), 'The detail action must reveal item information, not only another button');
          await action.click();
          assert.equal(await page.locator('#booking-form').isVisible(), true, 'The 예약하기 action must open the booking form');
        };
        await exercise('booking-validation', async page => { await open(page); await button(page, '예약 확정').click(); assert.equal(await page.locator('#confirmation').isVisible(), false, `Empty booking must not display #confirmation (class=${await page.locator('#confirmation').getAttribute('class')}); verify form validation and hidden state styling`); });
        await exercise('booking-persist-cancel', async page => {
          await open(page);
          await page.locator('#guest').fill('테스트 사용자');
          await page.locator('#date').fill('2027-05-15');
          await page.locator('#slot').selectOption({ index: 1 });
          await button(page, '예약 확정').click();
          assert.match(await page.locator('#confirmation').innerText(), /테스트 사용자/);
          await page.reload();
          assert.match(await page.locator('#confirmation').innerText(), /테스트 사용자/);
          await button(page, '예약 취소').click();
          await page.reload();
          assert.equal(await page.locator('#confirmation').isVisible(), false, `Cancelled booking must not display #confirmation after reload (class=${await page.locator('#confirmation').getAttribute('class')}); verify saved state and hidden state styling`);
        });
      }
      if (fixture.flow === 'dispatch') await exercise('ticket-create-complete-persist', async page => {
        await button(page, '새 요청').click();
        await page.locator('#title').fill('프린터 용지 걸림');
        await page.locator('#space').fill('서쪽 사무실');
        await page.locator('#priority').selectOption({ label: '긴급' });
        await page.locator('#assignee').fill('김담당');
        await button(page, '등록').click();
        await page.locator('#search').fill('프린터 용지 걸림');
        await button(page, '상세').first().click();
        assert.match(await page.locator('#detail').innerText(), /프린터 용지 걸림/);
        await button(page, '처리 완료').click();
        await page.reload();
        await page.locator('#search').fill('프린터 용지 걸림');
        await button(page, '상세').first().click();
        assert.match(await page.locator('#detail').innerText(), /프린터 용지 걸림/);
        const status = await page.locator('#detail').evaluate(el => { const copy = el.cloneNode(true); copy.querySelectorAll('button').forEach(button => button.remove()); return copy.textContent; });
        assert.match(status, /완료/, 'Selected request has no persisted completion status');
      });
      if (fixture.flow === 'dispatch') await exercise('ticket-user-content-is-text', async page => {
        await button(page, '새 요청').click();
        await page.locator('#title').fill('<b>literal ticket</b>');
        await page.locator('#space').fill('서쪽 사무실');
        await page.locator('#priority').selectOption({ label: '긴급' });
        await page.locator('#assignee').fill('김담당');
        await button(page, '등록').click();
        await page.reload();
        assert.match(await page.locator('body').innerText(), /<b>literal ticket<\/b>/, 'User title was interpreted as HTML');
        assert.equal(await page.locator('b').filter({ hasText: 'literal ticket' }).count(), 0);
      });
      if (fixture.flow === 'learning') await exercise('lesson-progress-and-independent-notes', async page => {
        await page.getByRole('button', { name: /의미 있는 HTML/ }).click();
        assert.match(await page.locator('#lesson-title').innerText(), /의미 있는 HTML/);
        await page.locator('#note').fill('첫 수업 메모');
        await button(page, '메모 저장').click();
        await page.locator('#complete').click();
        assert.match(await page.locator('#progress').innerText(), /1\s*\/\s*8/);
        await page.getByRole('button', { name: /키보드 탐색/ }).click();
        assert.match(await page.locator('#lesson-title').innerText(), /키보드 탐색/);
        assert.equal(await page.locator('#note').inputValue(), '');
        await page.locator('#note').fill('둘째 수업 메모');
        await button(page, '메모 저장').click();
        await page.reload();
        await page.getByRole('button', { name: /의미 있는 HTML/ }).click();
        assert.equal(await page.locator('#note').inputValue(), '첫 수업 메모');
        assert.match(await page.locator('#progress').innerText(), /1\s*\/\s*8/);
      });
      if (fixture.flow === 'cooking') await exercise('ingredients-and-cooking-step-persist', async page => {
        await button(page, '요리 찾기').click();
        assert.match(await page.locator('body').innerText(), /재료를 선택/);
        await page.getByLabel('계란', { exact: true }).check();
        await page.getByLabel('두부', { exact: true }).check();
        await button(page, '요리 찾기').click();
        await button(page, '조리 시작').first().click();
        const first = await page.locator('#cooking').innerText();
        await button(page, '다음 단계').click();
        const second = await page.locator('#cooking').innerText();
        assert.notEqual(second, first);
        await page.reload();
        assert.equal(await page.locator('#cooking').innerText(), second);
        await button(page, '이전 단계').click();
        assert.equal(await page.locator('#cooking').innerText(), first);
      });
      if (fixture.flow === 'document') await exercise('document-create-edit-persist', async page => {
        await button(page, '새 이력서').click();
        await page.locator('#title').fill('접근성 개발자 지원');
        await page.locator('#name').fill('이새봄');
        await page.locator('#intro').fill('키보드 사용성을 연구합니다.');
        await button(page, '저장').click();
        await page.reload();
        await page.locator('#search').fill('접근성 개발자 지원');
        await button(page, '편집').first().click();
        assert.equal(await page.locator('#name').inputValue(), '이새봄');
      });
      if (fixture.flow === 'invitation') {
        await exercise('rsvp-persist-delete', async page => {
          await page.locator('#guest').fill('김하객');
          await page.locator('#people').fill('2');
          await button(page, '참석 응답 저장').click();
          await page.reload();
          assert.match(await page.locator('#confirmation').innerText(), /김하객/);
          await button(page, '응답 삭제').click();
          await page.reload();
          assert.doesNotMatch(await page.locator('#confirmation').innerText(), /김하객/);
        });
        await exercise('guestbook-literal-text', async page => {
          await page.locator('#author').fill('친구');
          await page.locator('#message').fill('<b>축하해요</b>');
          await button(page, '축하글 남기기').click();
          await page.reload();
          assert.match(await page.locator('#messages').innerText(), /<b>축하해요<\/b>/);
          assert.equal(await page.locator('#messages b').count(), 0);
        });
      }
    }
  } finally {
    await browser?.close();
    await new Promise(r => server.close(r));
  }
  await check('bound-dependencies', async () => assert.deepEqual([...unboundRequests], [], 'Page requests dependencies outside the reviewed source binding'));
  const report = { case: fixture.id, scope: fixture.scope, visual: 'UNVERIFIED', reviewRequired, measurements, contentInventory, checks, passed: checks.filter(c => c.status === 'PASS').length, total: checks.length };
  await writeFile(resolve(evidence, 'report.json'), JSON.stringify(report, null, 2));
  return report;
}
