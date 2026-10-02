import test from 'node:test';
import assert from 'node:assert/strict';
import { countComments, removeComments } from '../scripts/comments.mjs';

test('embedded CSS comments are removed without changing compound selectors or strings', () => {
  const css = '.card/* note */.selected { color: red; content: "/*literal*/"; }';
  assert.equal(countComments('', css, '').css, 1);
  assert.equal(removeComments('', css, '').css, '.card.selected { color: red; content: "/*literal*/"; }');
});

test('comment detection preserves comment-like text inside strings', () => {
  assert.deepEqual(countComments('<p>hello</p>', 'p::before { content: "/*text*/" }', 'const url = "https://example.com";'), { html: 0, css: 0, js: 0 });
  assert.deepEqual(countComments('<template><!--note--></template>', '/*note*/ p {}', 'const n = 1; //note'), { html: 1, css: 1, js: 1 });
});

test('comment removal preserves strings, tokens and JavaScript line breaks', () => {
  const cleaned = removeComments('<b>A</b><!--x--><i>B</i>', '/*x*/p{content:"/*literal*/"}', 'function f(){ return/*\ncomment*/1; } const url="https://example.com";');
  assert.deepEqual(countComments(cleaned.html, cleaned.css, cleaned.js), { html: 0, css: 0, js: 0 });
  assert.equal(cleaned.html, '<b>A</b><i>B</i>');
  assert.match(cleaned.css, /content:"\/\*literal\*\/"/);
  assert.match(cleaned.js, /return\s*\n\s*1/);
  assert.match(cleaned.js, /https:\/\/example.com/);
});
