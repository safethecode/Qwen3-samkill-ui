import { iconNodes, iconVersion } from './icon-assets.mjs';

export async function inspectIcons(page, options = {}) {
  const found = await page.locator('svg').evaluateAll(elements => elements.filter(element => element.checkVisibility()).map(element => {
    const control = element.closest('button,a,[role=button]');
    const style = getComputedStyle(element);
    const box = control?.getBoundingClientRect();
    const paint = [...element.children].filter(child => !['title', 'desc'].includes(child.localName)).map(child => {
      const css = getComputedStyle(child);
      return { stroke: css.stroke, strokeWidth: css.strokeWidth, opacity: css.opacity, strokeOpacity: css.strokeOpacity, visibility: css.visibility, display: css.display, transform: css.transform, fill: css.fill };
    });
    const iconBox = element.getBoundingClientRect();
    const invisible = !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) || !iconBox.width || !iconBox.height;
    const label = control && (control.getAttribute('aria-label') || (control.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim() || control.textContent.trim());
    return { name: element.dataset.iconName, source: element.dataset.iconSource, viewBox: element.getAttribute('viewBox'), nodes: [...element.children].filter(child => !['title', 'desc'].includes(child.localName)).map(child => [child.localName, Object.fromEntries([...child.attributes].map(attribute => [attribute.name, attribute.value]))]), control: Boolean(control), label, width: box?.width, height: box?.height, fill: style.fill, strokeWidth: style.strokeWidth, paint, invisible };
  }));
  const issues = [];
  const unverified = await page.locator('button,a,[role=button],img,[class*="icon"]').evaluateAll((elements, verified) => elements.filter(element => element.checkVisibility()).flatMap(element => {
    if (element.matches('img') && (/\.svg(?:[?#]|$)/i.test(element.getAttribute('src') || '') || element.closest('button,a,[role=button]'))) {
      const source = new URL(element.src, location.href);
      if (source.origin !== location.origin || !verified[source.pathname]) return [{ status: 'UNVERIFIED', problem: 'Image icon requires an asset manifest and rendered control review', src: element.getAttribute('src') }];
      const box = element.getBoundingClientRect();
      if (!element.complete || !element.naturalWidth || !box.width || !box.height || !element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return [{ status: 'FAIL', problem: 'Official image icon is not visibly rendered' }];
      const control = element.closest('button,a,[role=button]');
      if (control) {
        const label = control.getAttribute('aria-label') || (control.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ').trim() || control.textContent.trim() || element.alt;
        if (!label) return [{ status: 'FAIL', problem: 'Icon control has no accessible text label' }];
        const target = control.getBoundingClientRect();
        if (target.width < 24 || target.height < 24) return [{ status: 'UNVERIFIED', problem: 'Icon control is below 24px; verify applicable exceptions' }];
      }
      return [];
    }
    if (element.matches('button,a,[role=button]') && /\p{Extended_Pictographic}/u.test(element.textContent)) return [{ status: 'UNVERIFIED', problem: 'Emoji in a control requires explicit reference justification; do not substitute it for an official icon', text: element.textContent.trim() }];
    if (!element.matches('svg') && element.className?.toString().includes('icon') && !element.querySelector('svg,img') && ['::before', '::after'].some(pseudo => !['none', 'normal', '""'].includes(getComputedStyle(element, pseudo).content))) return [{ status: 'UNVERIFIED', problem: 'CSS or font icon requires source and glyph verification', class: element.className }];
    return [];
  }), options.verifiedImages || {});
  issues.push(...unverified);
  for (const icon of found) {
    if (!icon.name || icon.source !== `lucide@${iconVersion}`) { issues.push({ ...icon, status: 'UNVERIFIED', problem: 'SVG provenance requires an official asset manifest or documented existing-system review' }); continue; }
    try {
      const canonical = nodes => JSON.stringify(nodes.map(([tag, attributes]) => [tag, Object.entries(attributes).sort(([a], [b]) => a.localeCompare(b))]));
      if (icon.viewBox !== '0 0 24 24' || canonical(icon.nodes) !== canonical(iconNodes(icon.name))) issues.push({ ...icon, status: 'FAIL', problem: 'Icon geometry differs from the pinned official asset' });
    } catch { issues.push({ ...icon, status: 'FAIL', problem: 'Unknown official icon name' }); }
    if (icon.fill !== 'none') issues.push({ ...icon, status: 'FAIL', problem: 'Outline icon has an unsupported fill' });
    if (icon.invisible || icon.paint.some(item => item.stroke === 'none' || parseFloat(item.strokeWidth) <= 0 || Number(item.opacity) === 0 || Number(item.strokeOpacity) === 0 || item.visibility !== 'visible' || item.display === 'none')) issues.push({ ...icon, status: 'FAIL', problem: 'Official icon paint is suppressed by CSS' });
    if (icon.paint.some(item => item.transform !== 'none' || item.fill !== 'none')) issues.push({ ...icon, status: 'UNVERIFIED', problem: 'CSS changes official child geometry or fill; inspect rendered asset fidelity' });
    if (icon.control && !icon.label) issues.push({ ...icon, status: 'FAIL', problem: 'Icon control has no accessible text label' });
    if (icon.control && (icon.width < 24 || icon.height < 24)) issues.push({ ...icon, status: 'UNVERIFIED', problem: 'Icon control is below 24px; verify the applicable spacing or inline exception before completion' });
  }
  return { icons: found, issues, scope: 'Official inline geometry and basic control semantics; optical alignment, actual edge clicks and state transitions require separate evidence.' };
}
