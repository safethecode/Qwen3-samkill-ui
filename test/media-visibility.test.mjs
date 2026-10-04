import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {inspectMediaVisibility} from '../scripts/media-visibility.mjs';

test('loaded image with a positive box still fails when inset removes all paint',async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});
  try{
    const page=await browser.newPage();
    await page.setContent('<img id="photo" width="96" height="96" style="clip-path:inset(0 0 0 100% round 6px)" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%2296%22%3E%3Crect width=%2296%22 height=%2296%22 fill=%22red%22/%3E%3C/svg%3E">');
    await page.locator('img').evaluate(image=>image.decode());
    assert.equal((await inspectMediaVisibility(page)).issues[0].status,'FAIL');
    await page.locator('img').evaluate(image=>image.style.clipPath='none');
    assert.equal((await inspectMediaVisibility(page)).issues.length,0);
    await page.locator('img').evaluate(image=>image.style.clipPath='circle(40%)');
    assert.equal((await inspectMediaVisibility(page)).issues[0].status,'UNVERIFIED');
  }finally{await browser.close();}
});
