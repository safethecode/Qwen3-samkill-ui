import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export const readLayoutContract = target => readFile(resolve(target, 'design/layout-contract.json'), 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });

export async function inspectLayoutContract(page, contract, options = {}) {
  const results = [];
  const issues = [];
  const scope = 'Declared DOM ownership, rendered geometry, row grouping and sample width. These measurements do not certify visual equivalence or undeclared relationships.';
  if (!contract) return { results, issues: [{ status: 'UNVERIFIED', problem: 'Reference layout ownership and grouping contract is missing' }], scope };
  if (!Array.isArray(contract.rules) || !contract.rules.length || contract.rules.length > 64 || new Set(contract.rules.map(rule => rule.id)).size !== contract.rules.length) return { results, issues: [{ status: 'FAIL', problem: 'Layout contract requires 1–64 uniquely identified rules' }], scope };
  const width = page.viewportSize()?.width;
  const state = options.state || 'initial';
  const box = async (selector, surface = page) => {
    if (typeof selector !== 'string' || !selector.trim()) throw new Error('A concrete selector is required');
    const locator = surface.locator(selector);
    if (await locator.count() !== 1) throw new Error(`Expected one layout subject: ${selector}`);
    if (!await locator.evaluate(element => element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))) throw new Error(`Layout subject is hidden: ${selector}`);
    const bounds = await locator.boundingBox();
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) throw new Error(`Layout subject has no visible bounds: ${selector}`);
    return bounds;
  };
  const inside = (a, b) => a.x >= b.x - .5 && a.y >= b.y - .5 && a.x + a.width <= b.x + b.width + .5 && a.y + a.height <= b.y + b.height + .5;
  for (const rule of contract.rules) {
    if (rule.widths && (!Array.isArray(rule.widths) || rule.widths.some(value => !Number.isInteger(value) || value < 1))) { issues.push({ status: 'FAIL', problem: `Invalid widths for ${rule.id}` }); continue; }
    if (rule.states && (!Array.isArray(rule.states) || rule.states.some(value => typeof value !== 'string'))) { issues.push({ status: 'FAIL', problem: `Invalid states for ${rule.id}` }); continue; }
    if (rule.widths && !rule.widths.includes(width) || rule.states && !rule.states.includes(state)) continue;
    let observed = {};
    try {
      if (!rule.id || typeof rule.id !== 'string') throw new Error('Layout rule needs an ID');
      if (rule.kind === 'absent') {
        observed.count = await page.locator(rule.subject).count();
        if (observed.count) throw new Error(`Content appears outside its declared ownership: ${rule.subject}`);
      } else if (rule.kind === 'rowLimit') {
        if (!Array.isArray(rule.groups) || rule.groups.length < 2 || !Number.isInteger(rule.maximum) || rule.maximum < 1 || rule.maximum >= rule.groups.length) throw new Error('Invalid row-group limit');
        observed.boxes = await Promise.all(rule.groups.map(selector => box(selector)));
        const events = observed.boxes.flatMap(bounds => [[bounds.y + .5, 1], [bounds.y + bounds.height - .5, -1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        let active = 0;
        observed.maximumInlineGroups = 0;
        for (const [, delta] of events) { active += delta; observed.maximumInlineGroups = Math.max(observed.maximumInlineGroups, active); }
        if (observed.maximumInlineGroups > rule.maximum) throw new Error(`Too many semantic groups share a row: ${observed.maximumInlineGroups} > ${rule.maximum}`);
      } else {
        observed.subject = await box(rule.subject);
        if (rule.kind === 'contained') {
          observed.container = await box(rule.container);
          const owns = await page.locator(rule.container).evaluate((container, selector) => container.contains(document.querySelector(selector)), rule.subject);
          if (!owns || !inside(observed.subject, observed.container)) throw new Error('Action/content is outside its declared owner');
        } else if (rule.kind === 'below' || rule.kind === 'disjoint') {
          observed.reference = await box(rule.reference);
          if (rule.kind === 'below') {
            if (rule.minGap !== undefined && (!Number.isFinite(rule.minGap) || rule.minGap < 0)) throw new Error('Invalid minimum gap');
            if (observed.subject.y + .5 < observed.reference.y + observed.reference.height + (rule.minGap || 0)) throw new Error('Declared regions are not vertically separated');
          } else {
            const a = observed.subject, b = observed.reference;
            if (Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > .5 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > .5) throw new Error('Declared independent regions overlap');
          }
        } else if (rule.kind === 'sampleWidth') {
          if (!/^[\w-]+\.html$/.test(rule.sample || '')) throw new Error('Sample must be a local HTML file');
          const context = await page.context().browser().newContext({ viewport: page.viewportSize() });
          const sample = await context.newPage();
          try {
            await sample.setViewportSize(page.viewportSize());
            await sample.goto(new URL(rule.sample, page.url()).href);
            await sample.evaluate(() => document.fonts.ready);
            observed.sample = await box(rule.subject, sample);
            if (Math.abs(observed.subject.width - observed.sample.width) > .5 || Math.abs(observed.subject.x - observed.sample.x) > .5) throw new Error('Standalone sample and assembled slot have different available widths or insets');
          } finally { await context.close(); }
        } else throw new Error(`Unsupported layout relation: ${rule.kind}`);
      }
      results.push({ id: rule.id, kind: rule.kind, status: 'PASS', observed });
    } catch (error) {
      const detail = error.message.slice(0, 500);
      results.push({ id: rule.id, kind: rule.kind, status: 'FAIL', detail, observed });
      issues.push({ status: 'FAIL', problem: `${rule.id}: ${detail}` });
    }
  }
  if (!results.length && !issues.length) issues.push({ status: 'UNVERIFIED', problem: 'No declared layout relation was checked for this viewport/state' });
  return { results, issues, scope };
}
