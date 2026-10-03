import { readFile, writeFile, mkdir, copyFile, access, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serviceCases } from '../evals/service-cases.mjs';

const [studyDirectory, referenceDirectory, destination] = process.argv.slice(2);
if (!studyDirectory || !referenceDirectory || !destination) throw new Error('Usage: node scripts/service-gallery.mjs STUDY REFERENCES OUTPUT');
const revalidated = await access(resolve(studyDirectory, 'revalidation.json')).then(() => true, () => false);
const study = JSON.parse(await readFile(resolve(studyDirectory, revalidated ? 'revalidation.json' : 'study.json'), 'utf8'));
const output = resolve(destination);
await mkdir(output, { recursive: true });
const escape = text => String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const sections = [];
for (const fixture of serviceCases) {
  const result = study.results.find(r => r.case === fixture.id);
  const directory = resolve(output, fixture.id);
  await mkdir(directory, { recursive: true });
  const contract = await readFile(resolve(studyDirectory, fixture.id, 'source/DESIGN.md'), 'utf8').catch(() => fixture.contract);
  const reference = await readFile(resolve(studyDirectory, fixture.id, 'source/REFERENCE.md'), 'utf8').catch(() => fixture.reference);
  const images = [];
  for (const width of [390, 1440, 320]) {
    const pair = [];
    for (const [kind, source] of [['reference', resolve(referenceDirectory, fixture.id, `${width}.png`)], ['candidate', resolve(studyDirectory, fixture.id, revalidated ? 'reevaluated' : 'evidence', `${width}.png`)]]) {
      if (!await access(source).then(() => true, () => false)) continue;
      await copyFile(source, resolve(directory, `${kind}-${width}.png`));
      pair.push(`<figure><figcaption>${kind === 'reference' ? 'samkill-ui 원본' : escape(study.model)} · ${width}px</figcaption><a href="${fixture.id}/${kind}-${width}.png"><img loading="lazy" src="${fixture.id}/${kind}-${width}.png" alt="${escape(fixture.title)} ${kind} ${width}px"></a></figure>`);
    }
    images.push(`<details ${width === 390 ? 'open' : ''}><summary>${width}px 비교</summary><div class="pair">${pair.join('') || '<p>캡처 없음</p>'}</div></details>`);
  }
  for (const [kind, source] of [['reference', resolve(referenceDirectory, fixture.id)], ['candidate', resolve(studyDirectory, fixture.id, revalidated ? 'reevaluated' : 'evidence')], ['manual-inspection', resolve(studyDirectory, fixture.id, 'manual-states')]]) {
    const files = (await readdir(source).catch(() => [])).filter(name => name.endsWith('.png') && !/^\d+(?:-full)?\.png$/.test(name));
    const states = [];
    for (const file of files) {
      const name = `${kind}-${file}`;
      await copyFile(resolve(source, file), resolve(directory, name));
      states.push(`<figure><figcaption>${escape(kind)} · ${escape(file)}</figcaption><a href="${fixture.id}/${encodeURIComponent(name)}"><img loading="lazy" src="${fixture.id}/${encodeURIComponent(name)}" alt="${escape(file)}"></a></figure>`);
    }
    if (states.length) images.push(`<details><summary>${kind === 'reference' ? '원본 추가 화면' : kind === 'manual-inspection' ? '직접 검사로 추가 확인한 화면 · 자동 검사 통과를 뜻하지 않음' : '실행한 동작의 결과 화면'} · 서로 같은 상태라는 보장은 없음</summary><div class="pair">${states.join('')}</div></details>`);
  }
  sections.push(`<section id="${fixture.id}"><h2>${escape(fixture.title)}</h2><p>${escape(fixture.scope)} · ${result?.total ? `실행 검사 ${result.passed}/${result.total}` : escape(result?.error || '실행 결과 없음')} · 시각 품질 자동 승인 없음</p><p>${escape(reference)}</p>${images.join('')}<details><summary>고정한 서비스 기획</summary><pre>${escape(contract)}</pre></details></section>`);
}
await writeFile(resolve(output, 'index.html'), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>서비스별 로컬 UI 비교</title><style>:root{font-family:system-ui,sans-serif;color:#172331;background:#f2f4f5;font-size:16px;line-height:1.6}body{margin:0 auto;padding:32px;max-width:1320px}h1{font-size:30px}h2{font-size:24px}section{background:white;padding:24px;margin:32px 0;border-radius:12px}.pair{display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap}figure{margin:16px 0;flex:1;min-width:240px}img{display:block;max-width:100%;max-height:900px;height:auto}figcaption{font-weight:600;margin-bottom:12px}summary{cursor:pointer;padding:12px 0;font-weight:600}pre{white-space:pre-wrap;font:inherit}a{color:#185b89}@media(max-width:600px){body{padding:16px}section{padding:16px}.pair{display:block}}</style></head><body><h1>서비스별 로컬 UI 비교</h1><p>7개 원본 라운드와 독립 기획 3개를 분리해 봅니다. 5·6·7라운드는 원본 저장소에 없습니다. 검사는 계약한 동작과 기본 렌더링만 측정하며, 숫자가 디자인 동등성이나 원본 전체 기능의 재현을 뜻하지 않습니다.</p><p>원본의 사진·브랜드 자산을 생성 모델에 제공하지 않은 구조 과제입니다. 사진 중심 화면의 미디어 완성도는 별도 부족 사항으로 평가해야 합니다. 신규 서비스는 원본을 그대로 복제하는 과제가 아닙니다.</p><nav>${serviceCases.map(c => `<a href="#${c.id}">${escape(c.title)}</a>`).join(' · ')}</nav>${sections.join('')}</body></html>`);
await writeFile(resolve(output, 'study.json'), JSON.stringify(study, null, 2));
