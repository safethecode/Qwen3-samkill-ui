export async function inspectTypography(page) {
  return page.evaluate(() => [...document.querySelectorAll('body *')].flatMap(element => {
    if (!element.checkVisibility()) return [];
    const control = element.matches('input:not([type="hidden"]), textarea, select');
    const text = [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim());
    if (!control && !text) return [];
    const styles = [[null, getComputedStyle(element)]];
    if (element.getAttribute('placeholder')) styles.push(['::placeholder', getComputedStyle(element, '::placeholder')]);
    return styles.filter(([, style]) => parseFloat(style.fontSize) < 14 || parseFloat(style.fontWeight) < 500).map(([pseudo, style]) => ({ element: element.tagName, id: element.id, class: element.className, pseudo, text: (element.value || element.textContent || '').trim().slice(0, 30), fontSize: style.fontSize, fontWeight: style.fontWeight }));
  }));
}
