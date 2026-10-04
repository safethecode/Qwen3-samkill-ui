export async function inspectStackedButtons(page, names) {
  const items = [];
  const issues = [];
  let previous;
  for (const name of names) {
    const matches = await page.getByRole('button', { name, exact: true }).all();
    const visible = [];
    for (const match of matches) if (await match.isVisible()) visible.push(match);
    if (visible.length !== 1) {
      issues.push({ name, problem: 'Required button is missing or ambiguous', count: visible.length });
      continue;
    }
    const item = await visible[0].evaluate(element => {
      const rect = element.getBoundingClientRect();
      const ancestors = [];
      for (let parent = element.parentElement; parent && ancestors.length < 4; parent = parent.parentElement) {
        const style = getComputedStyle(parent);
        ancestors.push({ tag: parent.tagName, id: parent.id, class: String(parent.className), display: style.display, direction: style.flexDirection, minWidth: style.minWidth, overflowX: style.overflowX });
      }
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, viewport: innerWidth, ancestors };
    });
    items.push({ name, ...item });
    if (item.left < -1 || item.right > item.viewport + 1) issues.push({ name, problem: 'Required stacked button extends outside the viewport', ...item });
    if (previous && item.top < previous.bottom - 1) issues.push({ name, problem: 'Required button is not below the preceding button', previous: previous.name, ...item });
    previous = { name, ...item };
  }
  return { items, issues, scope: 'Explicit ordered-button stacking only; not a compactness, week-control, typography or overall design approval.' };
}
