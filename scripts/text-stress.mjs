export async function inspectTextStress(page, capture = async () => {}) {
  const reports = [];
  const nodes = await page.locator('body,body *').elementHandles();
  const originals = await Promise.all(nodes.map(node => node.evaluate(element => element.getAttribute('style'))));
  for (const mode of ['text-200', 'text-spacing']) {
    let spacing;
    try {
      if (mode === 'text-200') {
        const sizes = await Promise.all(nodes.map(node => node.evaluate(element => parseFloat(getComputedStyle(element).fontSize))));
        await Promise.all(nodes.map((node, index) => node.evaluate((element, size) => element.style.setProperty('font-size', `${size * 2}px`, 'important'), sizes[index])));
      } else spacing = await page.addStyleTag({ content: 'body,body *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
      const geometry = await page.evaluate(() => {
        const visible = element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && element.getBoundingClientRect().width > 0;
        const describe = element => ({ tag: element.tagName, id: element.id, class: String(element.className), text: element.textContent.trim().slice(0, 100), width: element.clientWidth, scrollWidth: element.scrollWidth, height: element.clientHeight, scrollHeight: element.scrollHeight, overflow: getComputedStyle(element).overflow });
        const elements = [...document.querySelectorAll('body *')].filter(visible);
        const flexPressure = elements.flatMap(element => {
          const parent = element.parentElement;
          if (!parent) return [];
          const style = getComputedStyle(element);
          const layout = getComputedStyle(parent);
          if (!['flex', 'inline-flex'].includes(layout.display) || !layout.flexDirection.startsWith('row') || parent.scrollWidth <= parent.clientWidth + 1 || style.minWidth !== 'auto' || Number(style.flexShrink) === 0) return [];
          return [{ tag: element.tagName, id: element.id, class: String(element.className), width: element.getBoundingClientRect().width, minWidth: style.minWidth, flexShrink: style.flexShrink, flexBasis: style.flexBasis, parent: { tag: parent.tagName, id: parent.id, class: String(parent.className), width: parent.clientWidth, scrollWidth: parent.scrollWidth, display: layout.display, gap: layout.gap }, hypothesis: 'An automatic intrinsic minimum may prevent this flex item from shrinking. Inspect its min-width and sibling space; allow shrink/wrap without hiding content or changing font size.' }];
        }).slice(0, 10);
        const clippedByAncestor = [];
        for (const element of elements) {
          const rects = [];
          if (element.matches('input,button,select,textarea,img')) rects.push(element.getBoundingClientRect());
          else for (const node of element.childNodes) {
            if (node.nodeType !== 3 || !node.textContent.trim()) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            rects.push(...range.getClientRects());
          }
          for (let ancestor = element.parentElement; ancestor && rects.length; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            const bounds = ancestor.getBoundingClientRect();
            const left = bounds.left + ancestor.clientLeft;
            const top = bounds.top + ancestor.clientTop;
            const cutsX = /^(hidden|clip)$/.test(style.overflowX);
            const cutsY = /^(hidden|clip)$/.test(style.overflowY);
            if (rects.some(rect => cutsX && (rect.left < left - 1 || rect.right > left + ancestor.clientWidth + 1) || cutsY && (rect.top < top - 1 || rect.bottom > top + ancestor.clientHeight + 1))) {
              clippedByAncestor.push({ ...describe(element), clippedBy: { tag: ancestor.tagName, id: ancestor.id, class: String(ancestor.className), overflowX: style.overflowX, overflowY: style.overflowY } });
              break;
            }
          }
        }
        return {
          viewport: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          overflowPx: Math.max(0, document.documentElement.scrollWidth - innerWidth - 1),
          flexPressure,
          clippedByAncestor,
          outsideViewport: elements.filter(element => element.getBoundingClientRect().right > innerWidth + 1).slice(0, 30).map(describe),
          clippingCandidates: elements.filter(element => element.textContent.trim() && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)).slice(0, 50).map(describe)
        };
      });
      reports.push({ mode, ...geometry, visual: 'UNVERIFIED', method: 'Chromium computed-font 200% enlargement or separate text-spacing override; not real-device zoom. Clipping candidates need visual review.' });
      await capture(mode);
    } finally {
      if (spacing) await spacing.evaluate(element => element.remove());
      await Promise.all(nodes.map((node, index) => node.evaluate((element, original) => original == null ? element.removeAttribute('style') : element.setAttribute('style', original), originals[index])));
    }
  }
  await Promise.all(nodes.map(node => node.dispose()));
  return reports;
}

