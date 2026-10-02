export async function chooseFilter(page, name) {
  const button = page.getByRole('button', { name, exact: true });
  if (await button.count() === 1 && await button.isVisible()) return button.click();
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const select = page.locator('select').filter({ has: page.locator('option').filter({ hasText: new RegExp(`^${escaped}$`) }) });
  if (await select.count() !== 1) throw new Error(`No unique button or select option for filter: ${name}`);
  await select.selectOption({ label: name });
}

export async function readDocumentCards(page) {
  return page.evaluate(() => [...document.querySelectorAll('button')].filter(element => element.textContent.trim() === '편집').slice(0, 3).map(button => {
    let card = button;
    while (card.parentElement && !['BODY', 'HTML'].includes(card.parentElement.tagName) && [...card.parentElement.querySelectorAll('button')].filter(element => element.textContent.trim() === '편집').length === 1) card = card.parentElement;
    const rect = card.getBoundingClientRect();
    return { text: card.innerText, x: rect.x, y: rect.y, width: rect.width, bottom: rect.bottom };
  }));
}
