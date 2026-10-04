import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { writeIconAssets } from '../../scripts/icon-assets.mjs';
import { generateComponents } from '../../scripts/generate-components.mjs';
import { evaluateService } from '../../scripts/service-evaluate.mjs';
import { serviceCases } from '../evals/service-cases.mjs';
const root = 'runs/trip-components-live';
const target = `${root}/source`;
const upstream = process.env.TRIP_UPSTREAM;
if (!upstream) throw new Error('Set TRIP_UPSTREAM to the inspected upstream round-01 directory');
await mkdir(`${target}/design`, { recursive: true });
await mkdir(`${target}/assets/reference`, { recursive: true });
await cp('evals/results/mentor-metadata-common/source/assets/fonts', `${target}/assets/fonts`, { recursive: true });
await cp('evals/results/mentor-metadata-common/source/design/typography.json', `${target}/design/typography.json`);
for (const file of ['photo-1.png', 'photo-2.png', 'photo-3.png', 'photo-fragment.png', 'crops.json']) await cp(`${upstream}/assets/${file}`, `${target}/assets/reference/${file}`);
await cp('evals/results/uibowl-live-2026-10-04/trip.jpg', `${target}/assets/reference/source.jpg`);
await cp('evals/results/uibowl-live-2026-10-04/retrieval.json', `${target}/assets/reference/live-retrieval.json`);
await writeIconAssets(target, ['ChevronLeft', 'GripVertical']);
const reference = { status: 'inspected', source: 'assets/reference/source.jpg', provenance: 'Authenticated UI Bowl representative preview retrieved and visually inspected 2026-10-04; metadata in live-retrieval.json. Original upstream round01 P1/P2 and photo crops also inspected.', limitations: 'Original CSS, font, disabled conditions and hidden Day3 content unknown. Static translation; source media licensing beyond supplied reference remains unverified. Chosen minimum14px/500 typography differs from small raster text.' };
const shared = 'Travel itinerary reference: white narrow mobile frame, centered title, compact day pills, day headings aligned with OUTSIDE-card checkboxes. Card owns edge-to-edge square photo, text, quiet grip. White card with subtle border is a content boundary, not a decorative separator. No shadows, hero, invented data, summaries or dashboards. Minimum14px/500. Noto Sans KR actual supplied font. At320px and enlarged text grow row height, wrap words; never hide text or shrink fonts. Static controls disabled with opacity1. Day3 is explicitly an observed partial fragment, not reconstructed hidden data. Shared assembly owns outer spacing. All dimensions are chosen adaptations based on upstream observations.';
const sharedCss = '*{box-sizing:border-box}body{margin:0;background:#fff;color:#111;font:500 14px/1.5 "Noto Sans KR",sans-serif}button,input{font:inherit}button:disabled,input:disabled{opacity:1}h1,h2,p{margin:0}img{display:block}.frame{max-width:430px;margin:auto;padding:0 24px 24px;--ink:#111;--muted:#666;--border:#e8e8e8}.tabs-slot{margin-top:26px}.days-slot{margin-top:26px}.footer-slot{margin-top:24px}.disclosure{margin-top:16px;color:#666}button:focus-visible,input:focus-visible{outline:2px solid #111;outline-offset:3px}@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}';
const row = (id, photo, title, region, type) => `<div class="place-row" id="${id}"><input id="${id}-check" type="checkbox" disabled aria-labelledby="${id}-name"><div class="place-card" id="${id}-card"><img class="place-photo" id="${id}-photo" src="assets/reference/${photo}" alt="참조의 장소 사진"><div class="place-copy"><label class="place-title" id="${id}-name" for="${id}-check">${title}</label>${region ? `<p class="place-region">${region}</p>` : ''}<p class="place-type">${type}</p></div><img class="place-grip" src="assets/icons/GripVertical.svg" alt="정적 순서 표시"></div></div>`;
const html = {
  E1: '<header data-ui-unit="E1" class="trip-header"><button type="button" disabled aria-label="뒤로가기 정적 예시"><img src="assets/icons/ChevronLeft.svg" alt="" width="24" height="24"></button><h1>여행 일정 편집</h1><span aria-hidden="true"></span></header>',
  E2: '<div data-ui-unit="E2" class="day-tabs" role="group" aria-label="날짜 선택 예시"><button type="button" disabled aria-pressed="true">Day 1</button><button type="button" disabled aria-pressed="false">Day 2</button><button type="button" disabled aria-pressed="false">Day 3</button></div>',
  E3: `<div data-ui-unit="E3" class="itinerary"><section class="day-group"><h2>Day 1 <span>(06.25)</span></h2>${row('place1','photo-1.png','Jingūmae, Shibuya','','Activity')}</section><section class="day-group"><h2>Day 2 <span>(06.26)</span></h2>${row('place2','photo-2.png','와라타코 하라주쿠 오모테산도점','Jingūmae, Shibuya','Restaurant')}${row('place3','photo-3.png','Dōgenzaka, Shibuya','','Restaurant')}</section><section class="day-group"><h2>Day 3 <span>(06.27)</span></h2><div class="partial-slot" aria-label="원본에서 일부만 보이는 장소"><div class="partial-card"><img src="assets/reference/photo-fragment.png" alt="관찰된 사진 상단 조각"></div></div></section></div>`,
  E4: '<footer data-ui-unit="E4" class="trip-footer"><button type="button" disabled>수정 완료</button></footer>'
};
const prompts = {
  E1: 'Header62px minimum. Equal44px side slots and flexible centered title18px/26px/700. Back image24px. Transparent disabled button. Center title on screen, not leftover space. Wrap when text enlarged. No outer padding beyond parent24px.',
  E2: 'Three small content-width pills64x32px minimum, gap8px, radius16px. Selected black/white; others white/black with1px pale border.14px/700. Do not stretch across frame. Allow wrapping on enlargement.',
  E3: 'Day headings16px/22px/700; date500 muted. Heading to row16px; same-day row gap18px; between day groups40px. Place rows grid22px checkbox +9px gap + flexible card; checkbox outside, vertically centered. Card flex photo96px square edge-to-edge, gap16px, flexible copy min-width0,18px grip with6px right inset. Border1px #e8e8e8 radius6px. Card min-height96px and automatic growth; photo stays96px square across all rows, clips only its own left corners. Text14px/19px, title/region700,type500 muted; no ellipsis or nowrap. At320px/enlargement break long words and grow height; do not squeeze photo. All checkbox labels visible. The partial-slot has margin-left31px,height18px,overflow:hidden ONLY for the explicitly unknown Day3 fragment. Inside partial-card min-height96px with same border and upper corners; its top and right boundary stay visible. Fragment image width96px. No new hidden text.',
  E4: 'Full-width quiet disabled completion button min-height56px radius12px, gray #bdbdbd background, white16px/700. No divider or icon. Separate footer; no fixed overlay. At enlargement button grows.'
};
const elements = Object.keys(html).map(id => ({ id, html: html[id], prompt: prompts[id], assets: id === 'E1' ? ['assets/icons/ChevronLeft.svg'] : id === 'E3' ? ['assets/icons/GripVertical.svg', ...['photo-1.png','photo-2.png','photo-3.png','photo-fragment.png'].map(name => `assets/reference/${name}`)] : [], sample: `<main class="frame">{{${id}}}</main>` }));
const plan = { reference, shared, sharedCss, elements, assembly: '<main class="frame">{{E1}}<div class="tabs-slot">{{E2}}</div><div class="days-slot">{{E3}}</div><div class="footer-slot">{{E4}}</div><p class="disclosure">정적 참조 번역 예시 · 실제 일정 변경은 제공하지 않습니다.</p></main>' };
await writeFile(`${target}/design/component-plan.json`, JSON.stringify(plan, null, 2));
const rules = elements.map(({id}) => ({id:`sample-${id}`,kind:'sampleWidth',subject:`[data-ui-unit="${id}"]`,sample:`sample-${id}.html`}));
for (const id of ['place1','place2','place3']) rules.push({id:`outside-${id}`,kind:'disjoint',subject:`#${id}-check`,reference:`#${id}-card`},{id:`photo-${id}`,kind:'contained',subject:`#${id}-photo`,container:`#${id}-card`});
rules.push({id:'footer-after-days',kind:'below',subject:'[data-ui-unit="E4"]',reference:'[data-ui-unit="E3"]',minGap:24});
await writeFile(`${target}/design/layout-contract.json`, JSON.stringify({rules}, null, 2));
await writeFile(`${target}/DESIGN.md`, `${shared}\n\n${Object.entries(prompts).map(([id,prompt])=>`${id}: ${prompt}`).join('\n\n')}`);
await writeFile(`${target}/REFERENCE.md`, JSON.stringify(reference, null, 2));
await generateComponents(target, `${root}/generation`);
const report = await evaluateService(target, `${root}/revalidation`, serviceCases.find(item=>item.id==='round-01'), {textStress:true});
console.log({passed:report.passed,total:report.total});
