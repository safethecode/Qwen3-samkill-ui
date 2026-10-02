export async function inspectCardText(page, text) {
  return page.evaluate(wanted => {
    const original = { left: scrollX, top: scrollY };
    const hitStyle = document.createElement('style');
    hitStyle.textContent = '* { pointer-events: auto !important; }';
    document.head.append(hitStyle);
    const describe = element => element ? `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${[...element.classList].map(name => `.${name}`).join('')}` : null;
    try {
      return [...document.querySelectorAll('button')].filter(element => element.textContent.trim() === '편집').slice(0, 3).map(button => {
        let card = button;
        while (card.parentElement && !['BODY', 'HTML'].includes(card.parentElement.tagName) && [...card.parentElement.querySelectorAll('button')].filter(element => element.textContent.trim() === '편집').length === 1) card = card.parentElement;
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
        let failure = { visible: false, reason: 'missing' };
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const index = node.textContent.indexOf(wanted);
          if (index < 0) continue;
          const element = node.parentElement;
          const range = document.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + wanted.length);
          let rect = range.getBoundingClientRect();
          window.scrollTo({ left: scrollX + rect.left - innerWidth / 2, top: scrollY + rect.top - innerHeight / 2, behavior: 'instant' });
          rect = range.getBoundingClientRect();
          let bounds = { left: Math.max(0, rect.left), top: Math.max(0, rect.top), right: Math.min(innerWidth, rect.right), bottom: Math.min(innerHeight, rect.bottom) };
          let hidden = false;
          for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) hidden = true;
            const box = ancestor.getBoundingClientRect();
            if (/(hidden|clip|auto|scroll)/.test(style.overflowX)) { bounds.left = Math.max(bounds.left, box.left); bounds.right = Math.min(bounds.right, box.right); }
            if (/(hidden|clip|auto|scroll)/.test(style.overflowY)) { bounds.top = Math.max(bounds.top, box.top); bounds.bottom = Math.min(bounds.bottom, box.bottom); }
          }
          if (hidden || rect.width <= 0 || rect.height <= 0) { failure = { visible: false, reason: 'hidden' }; continue; }
          const area = Math.max(0, bounds.right - bounds.left) * Math.max(0, bounds.bottom - bounds.top);
          if (area < rect.width * rect.height * 0.9) { failure = { visible: false, reason: 'clipped', element: describe(element) }; continue; }
          const stack = document.elementsFromPoint((bounds.left + bounds.right) / 2, (bounds.top + bounds.bottom) / 2);
          let covering;
          for (const hit of stack) {
            if (element.contains(hit) || hit.contains(element)) break;
            const style = getComputedStyle(hit);
            const alpha = style.backgroundColor.startsWith('rgba') ? Number(style.backgroundColor.match(/,\s*([\d.]+)\)$/)?.[1] || 0) : style.backgroundColor === 'transparent' ? 0 : 1;
            let opacity = 1;
            for (let ancestor = hit; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
            if (opacity >= 0.9 && (alpha >= 0.9 || style.backgroundImage !== 'none' || /^(IMG|CANVAS|VIDEO)$/.test(hit.tagName))) { covering = hit; break; }
          }
          if (covering) { failure = { visible: false, reason: 'occluded', element: describe(element), coveredBy: describe(covering) }; continue; }
          return { visible: true };
        }
        return failure;
      });
    } finally { hitStyle.remove(); window.scrollTo({ ...original, behavior: 'instant' }); }
  }, text);
}
