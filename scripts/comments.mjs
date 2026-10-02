import { parse as parseJS } from 'acorn';
import postcss from 'postcss';
import tokenize from 'postcss/lib/tokenize';
import { parse as parseHTML } from 'parse5';

function cssComments(css) {
  postcss.parse(css, { map: false });
  const tokens = tokenize(new postcss.Input(css));
  const ranges = [];
  while (!tokens.endOfFile()) {
    const token = tokens.nextToken();
    if (token[0] === 'comment') ranges.push([token[2], token[3] + 1]);
  }
  return ranges;
}

export function countComments(html, css, js) {
  const counts = { html: 0, css: 0, js: 0 };
  const visit = node => {
    if (node.nodeName === '#comment') counts.html++;
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parseHTML(html));
  counts.css = cssComments(css).length;
  parseJS(js, { ecmaVersion: 'latest', sourceType: 'module', onComment: () => counts.js++ });
  return counts;
}

export function removeComments(html, css, js) {
  const ranges = { html: [], css: [], js: [] };
  const visit = node => {
    if (node.nodeName === '#comment') ranges.html.push([node.sourceCodeLocation.startOffset, node.sourceCodeLocation.endOffset]);
    for (const child of node.childNodes || []) visit(child);
    if (node.content) visit(node.content);
  };
  visit(parseHTML(html, { sourceCodeLocationInfo: true }));
  ranges.css = cssComments(css);
  parseJS(js, { ecmaVersion: 'latest', sourceType: 'module', onComment: (_block, _text, start, end) => ranges.js.push([start, end]) });
  const cleaned = {};
  for (const [kind, source] of Object.entries({ html, css, js })) {
    let text = source;
    for (const [start, end] of ranges[kind].sort((a, b) => b[0] - a[0])) text = text.slice(0, start) + (kind === 'js' ? text.slice(start, end).replace(/[^\r\n]/g, ' ') : '') + text.slice(end);
    cleaned[kind] = text;
  }
  return cleaned;
}
