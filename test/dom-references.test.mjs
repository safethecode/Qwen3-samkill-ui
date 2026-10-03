import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDomReferences } from '../scripts/dom-references.mjs';

test('split JavaScript cannot silently render into nonexistent shell containers', () => {
  const html = '<html><body><section id="catalogue"></section></body></html>';
  assert.throws(() => validateDomReferences(html, "const list=document.getElementById('class-list');if(list)list.textContent='classes';"), /class-list/);
  assert.doesNotThrow(() => validateDomReferences(html, "const list=document.getElementById('catalogue');list.innerHTML='<button id=\"detail\">Open</button>';document.querySelector('#detail').onclick=()=>{};"));
  assert.doesNotThrow(() => validateDomReferences(html, "const name='dynamic';document.getElementById(name);"));
});
