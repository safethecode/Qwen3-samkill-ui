import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const execute = promisify(execFile);

for (const mode of ['missing-empty-message', 'broken-search', 'enter-search', 'submit-search', 'debounced-search', 'instant-search-form', 'debounced-search-form']) {
  test(`search evaluation isolates later creation: ${mode}`, async () => {
    await mkdir(resolve(repo, 'runs'), { recursive: true });
    const target = await mkdtemp(resolve(repo, 'runs/search-regression-'));
    for (const name of ['index.html', 'styles.css', 'app.js']) {
      let source = await readFile(resolve(repo, 'examples/resume', name), 'utf8');
      if (mode === 'missing-empty-message' && name === 'index.html') source = source.replace('이력서가 없습니다. 새 이력서를 만들어보세요.', '');
      if (mode === 'broken-search' && name === 'app.js') source = source.replace("searchInput.addEventListener('input', renderResumes);", '');
      if (mode === 'enter-search' && name === 'app.js') source = source.replace("searchInput.addEventListener('input', renderResumes);", "searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') renderResumes(); });");
      if (['submit-search', 'instant-search-form', 'debounced-search-form'].includes(mode) && name === 'index.html') source = source.replace(/<div class="search-container">([\s\S]*?)<\/div>/, '<form id="fixture-search">$1<button type="submit">검색</button></form>');
      if (mode === 'submit-search' && name === 'app.js') source = source.replace("searchInput.addEventListener('input', renderResumes);", "document.getElementById('fixture-search').addEventListener('submit', event => { event.preventDefault(); renderResumes(); });");
      if (mode === 'debounced-search' && name === 'app.js') source = source.replace("searchInput.addEventListener('input', renderResumes);", "searchInput.addEventListener('input', () => setTimeout(renderResumes, 150));");
      if (mode === 'debounced-search-form' && name === 'app.js') source = source.replace("searchInput.addEventListener('input', renderResumes);", "searchInput.addEventListener('input', () => setTimeout(renderResumes, 600));");
      if (['instant-search-form', 'debounced-search-form'].includes(mode) && name === 'app.js') source += "\ndocument.getElementById('fixture-search').addEventListener('submit', event => { event.preventDefault(); throw new Error('Unwanted search submission'); });";
      await writeFile(resolve(target, name), source);
    }
    await execute(process.execPath, [resolve(repo, 'scripts/evaluate.mjs'), target, resolve(target, 'evidence')], { env: { ...process.env, QWEN_DESIGN_CHECKS: '0', QWEN_EVAL_VARIANT: '0' }, timeout: 60000 }).catch(error => { if (error.code !== 1) throw error; });
    const report = JSON.parse(await readFile(resolve(target, 'evidence/report.json'), 'utf8'));
    const status = name => report.results.find(result => result.name === name)?.status;
    assert.equal(status('search-label-and-empty-state'), ['missing-empty-message', 'broken-search'].includes(mode) ? 'FAIL' : 'PASS');
    assert.equal(status('visible-labels-and-create'), 'PASS');
    assert.equal(status('reload-persistence'), 'PASS');
    assert.equal(status('runtime-errors'), 'PASS');
  });
}
