import { readDocumentCards } from './controls.mjs';

export async function checkDesign(page, check, variant = false) {
  const assert = (ok, message) => { if (!ok) throw new Error(message); };
  const button = name => page.getByRole('button', { name, exact: true });
  const cards = () => readDocumentCards(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const values = [];
  await check('design-document-previews', async () => {
    assert(await button('편집').count() === 3, 'Design review requires the three initial documents');
    for (let index = 0; index < 3; index++) {
      await button('편집').nth(index).click();
      const entry = {};
      for (const label of ['이름', '직무', '소개']) entry[label] = await page.getByLabel(new RegExp(`^${label}\\s*\\*?$`)).inputValue();
      values.push(entry);
      await button('취소').click();
    }
    const rendered = await cards();
    const normalize = text => text.replace(/\s+/g, '');
    for (const [index, entry] of values.entries()) {
      assert(entry['소개'].trim().length >= 10, `Example ${index + 1} needs a substantive introduction`);
      for (const [label, text] of Object.entries(entry)) assert(text.trim() && normalize(rendered[index].text).includes(normalize(text)), `Document ${index + 1} preview omits ${label}; render the document content in the list, not only metadata`);
    }
  });
  await page.reload();
  await check('design-desktop-columns', async () => {
    const boxes = await cards();
    assert(boxes.length === 3 && boxes.every((box, index) => Math.abs(box.y - boxes[0].y) <= 4 && box.width >= 200 && (!index || box.x > boxes[index - 1].x + boxes[index - 1].width)), 'At 1440px, place the three document cards in one spaced row');
  });
  await check('design-heading-hierarchy', async () => {
    const heading = await page.getByRole('heading', { name: '내 이력서', exact: true }).boundingBox();
    const subtitle = await page.getByText('이 브라우저에 저장됩니다', { exact: true }).boundingBox();
    const action = await button('새 이력서').boundingBox();
    assert(heading && subtitle && action && Math.abs(heading.x - subtitle.x) <= 8 && subtitle.y >= heading.y + heading.height - 2 && action.x > heading.x + heading.width && action.y <= subtitle.y + subtitle.height, 'Place the subtitle under the left-aligned heading and the creation action on the right');
  });
  await check('design-paper-surfaces', async () => {
    assert(values.length === 3, 'Cannot inspect preview surfaces without example fields');
    const surfaces = await page.evaluate(values => values.map(entry => [...document.querySelectorAll('body *')].some(e => {
      const rect = e.getBoundingClientRect();
      const style = getComputedStyle(e);
      const text = (e.innerText || '').replace(/\s+/g, '');
      const parent = e.parentElement && getComputedStyle(e.parentElement);
      return style.backgroundColor === 'rgb(255, 255, 255)' && parent && !['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'].includes(parent.backgroundColor) && rect.height >= 160 && rect.width >= 150 && parseFloat(style.paddingTop) >= 12 && !e.querySelector('button') && [entry['이름'], entry['소개']].every(value => value && text.includes(value.replace(/\s+/g, '')));
    })), values);
    const observed = surfaces.every(Boolean) ? [] : await page.evaluate(entry => [...document.querySelectorAll('body *')].filter(element => {
      const text = (element.innerText || '').replace(/\s+/g, '');
      return !element.querySelector('button') && [entry['이름'], entry['소개']].every(value => value && text.includes(value.replace(/\s+/g, '')));
    }).slice(0, 4).map(element => {
      const style = getComputedStyle(element);
      const parent = element.parentElement;
      const bounds = element.getBoundingClientRect();
      return { tag: element.tagName, class: element.className, background: style.backgroundColor, padding: style.paddingTop, width: bounds.width, height: bounds.height, parent: parent?.className, parentBackground: parent && getComputedStyle(parent).backgroundColor };
    }), values[0]);
    assert(surfaces.every(Boolean), `Each card needs a padded white paper preview containing the person's name (이름 field) and introduction (소개 field) INSIDE a contrasting pale stage. A document title (제목) is not the person's name. Expected names inside the paper: ${JSON.stringify(values.map(entry => entry['이름']))}. Render each person's name inside the paper element, not only in metadata outside it. Paper background must be white, padding >=12px, height >=160px, width >=150px. Actual candidate elements: ${JSON.stringify(observed)}`);
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await check('design-mobile-stack', async () => {
    const boxes = await cards();
    assert(boxes.length === 3 && boxes.every(box => box.x >= 16 && box.x <= 24 && box.x + box.width <= 374) && boxes[1].y >= boxes[0].bottom && boxes[2].y >= boxes[1].bottom, 'At 390px, stack full-width document cards with approximately 20px page padding');
  });
  await check('design-reduced-motion', async () => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const moving = await page.evaluate(() => [...document.querySelectorAll('body *')].some(e => {
      const style = getComputedStyle(e);
      return [style.transitionDuration, style.animationDuration].some(value => value.split(',').some(time => parseFloat(time) * (time.trim().endsWith('ms') ? 1 : 1000) > 10));
    }));
    assert(!moving, 'Reduced-motion mode must disable or shorten transitions/animations to at most 10ms');
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  if (variant) {
    await check('variant-action-color', async () => assert(await button('새 이력서').evaluate(e => getComputedStyle(e).backgroundColor === 'rgb(109, 40, 217)'), 'Variant primary action must use #6d28d9'));
    await check('variant-content', async () => assert(values.length === 3 && ['데이터 분석가', '플랫폼 개발자', '제품 디자이너'].every(role => values.some(entry => entry['직무'] === role)) && new Set(values.map(entry => entry['소개'])).size === 3, 'Variant requires the three specified roles and distinct introductions'));
    await check('variant-width', async () => {
      const valid = await page.getByRole('heading', { name: '내 이력서', exact: true }).evaluate(e => {
        for (let node = e; node; node = node.parentElement) if (parseFloat(getComputedStyle(node).maxWidth) === 1040) return true;
        return false;
      });
      assert(valid, 'Variant content container must declare max-width:1040px');
    });
  }
}
