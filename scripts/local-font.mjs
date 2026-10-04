import { access, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

async function fontBytes(target, font) {
  if (!font || !/^assets\/[\w./-]+\.ttf$/.test(font.asset || '') || font.asset.split('/').includes('..') || !/^[a-f0-9]{64}$/.test(font.sha256 || '') || !/^[\p{L}\p{N} _-]+$/u.test(font.family || '')) throw new Error('Invalid local font identity');
  const weights = String(font.weight).split(' ').map(Number);
  if (weights.length < 1 || weights.length > 2 || weights.some(value => !Number.isInteger(value) || value < 1 || value > 1000) || (weights.length === 2 && weights[0] > weights[1])) throw new Error('Invalid declared font weight range');
  const root = await realpath(target);
  const path = await realpath(resolve(root, font.asset));
  if (!path.startsWith(root + sep)) throw new Error('Local font escapes target');
  const bytes = await readFile(path);
  if (createHash('sha256').update(bytes).digest('hex') !== font.sha256) throw new Error('Local font hash mismatch');
  return bytes;
}

export async function localFontCss(target, intent) {
  if (!intent?.localFont) return '';
  await fontBytes(target, intent.localFont);
  const font = intent.localFont;
  return `@font-face{font-family:${JSON.stringify(font.family)};src:url(${JSON.stringify(font.asset)}) format("truetype");font-weight:${font.weight};font-style:normal;font-display:swap;}\n`;
}

export async function prepareLocalFont(target, font) {
  for (const name of ['index.html', 'design/typography.json']) if (await access(resolve(target, name)).then(() => true, () => false)) throw new Error('Font preparation requires a fresh target without existing source or typography intent');
  const bytes = await fontBytes(target, font);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  let probe;
  try {
    const page = await browser.newPage();
    await page.setContent('<p id="sample">한글 ABC 0123456789</p>');
    await page.evaluate(async ({ data, weight }) => {
      const buffer = Uint8Array.from(atob(data), character => character.charCodeAt(0));
      const face = await new FontFace('BoundFontProbe', buffer, { weight }).load();
      document.fonts.add(face);
      document.querySelector('#sample').style.fontFamily = 'BoundFontProbe';
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
    }, { data: bytes.toString('base64'), weight: font.weight });
    const session = await page.context().newCDPSession(page);
    await session.send('DOM.enable');
    await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#sample' });
    probe = (await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts.filter(item => item.glyphCount > 0);
    if (!probe.length || probe.some(item => !item.isCustomFont)) throw new Error('Font probe did not render every sample glyph from the supplied file');
  } finally { await browser.close(); }
  const families = [...new Set(probe.map(item => item.familyName))];
  const intent = { roles: [{ selector: 'body *', families, requireCustomFont: true }], cssFamily: font.family, localFont: font, probe: { sample: '한글 ABC 0123456789', fonts: probe, scope: 'Isolated Chromium file identity probe before generation. Sample coverage only; declared variable weight support, full character coverage and loading-state layout are not certified.' } };
  await mkdir(resolve(target, 'design'), { recursive: true });
  await writeFile(resolve(target, 'design/typography.json'), JSON.stringify(intent, null, 2), { flag: 'wx' });
  return intent;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [target, profile] = process.argv.slice(2);
  if (!target || !profile) throw new Error('Usage: node scripts/local-font.mjs TARGET FONT_PROFILE_JSON');
  await prepareLocalFont(resolve(target), JSON.parse(await readFile(profile, 'utf8')));
}
