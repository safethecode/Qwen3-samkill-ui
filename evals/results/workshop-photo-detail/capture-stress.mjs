import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createServer} from 'node:http';
import {chromium} from 'playwright';
import {sourceBinding} from '../../../scripts/source-binding.mjs';
import {inspectFontRendering} from '../../../scripts/font-rendering.mjs';
import {inspectTypography} from '../../../scripts/typography-check.mjs';
import {inspectLayoutContract} from '../../../scripts/layout-contract.mjs';
import assert from 'node:assert/strict';
import {inspectTextStress} from '../../../scripts/text-stress.mjs';
import {harnessBinding} from '../../../scripts/harness-binding.mjs';
import {createHash} from 'node:crypto';
const root=process.argv[2]||'runs/workshop-photo-detail/source';
const evidence=process.argv[3]||'runs/workshop-photo-detail/render';
await mkdir(evidence,{recursive:true});
const binding=await sourceBinding(root);
const server=createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!binding[name])throw Error();res.setHeader('content-type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.svg':'image/svg+xml'})[extname(name)]||'application/octet-stream');res.end(await readFile(resolve(root,name)));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});
const typography=JSON.parse(await readFile(`${root}/design/typography.json`,'utf8'));
const reports=[];
try{
for(const width of [296,320,390,1440]){
const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
await page.goto(`http://127.0.0.1:${server.address().port}`);
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:`${evidence}/${width}.png`,fullPage:true});
let workflow={status:'NOT_IMPLEMENTED_STATIC_SAMPLE'};
if(await page.locator('#booking-dialog').count()){
await page.locator('#favorite').click();
assert.equal(await page.locator('#favorite').getAttribute('aria-pressed'),'true');
await page.locator('#favorite').click();
assert.equal(await page.locator('#favorite').getAttribute('aria-pressed'),'false');
await page.locator('#book').click();
await page.locator('.confirm-booking').click();
assert.equal(await page.locator('#confirmation').isVisible(),false);
await page.locator('#guest').fill('테스트 사용자');
await page.locator('#date').fill('2027-05-15');
await page.locator('#slot').selectOption('14:00');
await page.screenshot({path:`${evidence}/form-${width}.png`});
const formFonts=await inspectFontRendering(page,typography);
await page.locator('.confirm-booking').click();
await page.reload();
await page.locator('#book').click();
const text=await page.locator('#confirmation').innerText();
for(const expected of ['첫 번째 도자기 잔','테스트 사용자','2027-05-15','14:00','55,000원'])assert.ok(text.includes(expected),expected);
await page.screenshot({path:`${evidence}/confirmation-${width}.png`});
await page.locator('#cancel-booking').click();
await page.reload();
await page.locator('#book').click();
assert.equal(await page.locator('#booking-form').isVisible(),true);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#booking-dialog').isVisible(),false);
assert.equal(await page.locator('#book').evaluate(e=>e===document.activeElement),true);
workflow={status:'PASS',checks:['favorite toggle both directions','empty form rejected','selected class, guest, date, time and price visible after reload','cancel remains cancelled after reload','Escape closes dialog and restores trigger focus'],formFonts};
}
const rules=[{id:'favorite-with-booking',kind:'sameRow',subject:'#favorite',reference:'#book',tolerance:2},{id:'price-above-actions',kind:'below',subject:'#book',reference:'.price-row',minGap:16},{id:'photo-first',kind:'below',subject:'[data-ui-unit="identity"]',reference:'[data-ui-unit="media"]',widths:[296,320,390]},{id:'actions-after-identity',kind:'below',subject:'[data-ui-unit="booking"]',reference:'[data-ui-unit="identity"]'},...['media','identity','booking'].map(id=>({id:`${id}-sample`,kind:'sampleWidth',subject:`[data-ui-unit="${id}"]`,sample:`sample-${id}.html`}))];
reports.push({width,workflow,font:await inspectFontRendering(page,typography),typography:await inspectTypography(page),layout:await inspectLayoutContract(page,{rules}),geometry:await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,media:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.width,height:i.height})),title:document.querySelector('h1').getBoundingClientRect().toJSON(),action:document.querySelector('#book').getBoundingClientRect().toJSON()}))});
reports.at(-1).stress=await inspectTextStress(page,async(mode)=>{await page.screenshot({path:`${evidence}/${width}-${mode}.png`,fullPage:true});});await page.close();
}
await writeFile(`${evidence}/report.json`,JSON.stringify({status:'UNVERIFIED_VISUAL_QUALITY',sourceHashes:binding,harnessHashes:await harnessBinding(),captureSha256:createHash('sha256').update(await readFile(new URL(import.meta.url))).digest('hex'),reports},null,2));
console.log(reports.map(r=>({width:r.width,overflow:r.geometry.overflow,fontIssues:r.font.issues?.length,typeIssues:r.typography.length,layoutIssues:r.layout.issues.length})));
}finally{await browser.close();server.close();}
