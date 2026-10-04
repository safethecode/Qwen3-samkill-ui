export function hasVisibleLabel(field) {
  return [...field.labels || []].some(label => {
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || node.parentElement.closest('input,select,textarea,button,option')) continue;
      if (!node.parentElement.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rectangles = [...range.getClientRects()];
      if (rectangles.length && rectangles.every(rect => {
        if (rect.width <= 0 || rect.height <= 0 || rect.right <= 0 || rect.bottom <= 0) return false;
        for (let parent = node.parentElement; parent; parent = parent.parentElement) {
          const style = getComputedStyle(parent);
          const bounds = parent.getBoundingClientRect();
          if (style.clipPath !== 'none') return false;
          if (style.clip !== 'auto') {
            const clip = style.clip.match(/^rect\(([-\d.]+)px[, ]+([-\d.]+)px[, ]+([-\d.]+)px[, ]+([-\d.]+)px\)$/);
            if (!clip) return false;
            const [, top, right, bottom, left] = clip.map(Number);
            if (rect.left < bounds.left + left - .5 || rect.right > bounds.left + right + .5 || rect.top < bounds.top + top - .5 || rect.bottom > bounds.top + bottom + .5) return false;
          }
          if (/(hidden|clip|auto|scroll)/.test(style.overflowX) && (rect.left < bounds.left - .5 || rect.right > bounds.right + .5)) return false;
          if (/(hidden|clip|auto|scroll)/.test(style.overflowY) && (rect.top < bounds.top - .5 || rect.bottom > bounds.bottom + .5)) return false;
        }
        return true;
      })) return true;
    }
    return false;
  });
}

export async function inspectFieldLabels(page) {
  const missing = [];
  for (const field of await page.locator('input:not([type=hidden]),textarea,select').all()) {
    if (!await field.isVisible()) continue;
    if (!await field.evaluate(hasVisibleLabel)) missing.push(await field.evaluate(element => element.id || element.name || element.tagName));
  }
  return missing;
}
