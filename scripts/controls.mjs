export async function chooseFilter(page, name) {
  const button = page.getByRole('button', { name, exact: true });
  if (await button.count() === 1 && await button.isVisible()) return button.click();
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const select = page.locator('select').filter({ has: page.locator('option').filter({ hasText: new RegExp(`^${escaped}$`) }) });
  if (await select.count() !== 1) throw new Error(`No unique button or select option for filter: ${name}`);
  await select.selectOption({ label: name });
}
