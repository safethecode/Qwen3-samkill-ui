export function hasVisibleLabel(field) {
  return [...field.labels || []].some(label => {
    const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || node.parentElement.closest('input,select,textarea,button,option')) continue;
      if (!node.parentElement.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      if ([...range.getClientRects()].some(rect => rect.width > 0 && rect.height > 0)) return true;
    }
    return false;
  });
}

export async function inspectFieldLabels(page) {
  const missing = [];
  for (const field of await page.locator('input:not([type=hidden]),textarea,select').all()) {
    if (!await field.isVisible() || await field.isDisabled()) continue;
    if (!await field.evaluate(hasVisibleLabel)) missing.push(await field.evaluate(element => element.id || element.name || element.tagName));
  }
  return missing;
}
