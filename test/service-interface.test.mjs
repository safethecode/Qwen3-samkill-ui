import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInterface, validateShellLabels } from '../scripts/service-interface.mjs';

test('malformed option closing tags cannot silently discard a booking time', () => {
  const broken = '<label for="slot">Time</label><select id="slot"><option value="">Choose</option value="10:00">10:00</option></select>';
  assert.throws(() => validateShellLabels(broken), /end-tag-with-attributes/);
  assert.doesNotThrow(() => validateShellLabels(broken.replace('</option value="10:00">', '</option><option value="10:00">')));
});

test('stage boundary rejects renamed fields, wrong element types and duplicate IDs', () => {
  const required = { search: 'input', 'ticket-form': 'form' };
  assert.throws(() => validateInterface('<form id="search"><input id="query"></form>', required), /search/);
  assert.throws(() => validateInterface('<input id="search"><form id="ticket-form"></form><input id="search">', required), /exactly once/);
  assert.doesNotThrow(() => validateInterface('<input id="search"><form id="ticket-form"></form>', required));
});

test('generation rejects placeholder-only fields before later units build on the shell', () => {
  assert.throws(() => validateShellLabels('<input id="search" placeholder="수업 검색" aria-label="수업 검색">'), /search.*visible label/);
  assert.throws(() => validateShellLabels('<label for="search" hidden>검색</label><input id="search">'), /visible label/);
  assert.throws(() => validateShellLabels('<label for="search"><span hidden>검색</span></label><input id="search">'), /visible label/);
  assert.throws(() => validateShellLabels('<label><select id="slot"><option>10:00</option></select></label>'), /visible label/);
  assert.doesNotThrow(() => validateShellLabels('<label for="search">수업 검색</label><input id="search"><section hidden><label>예약자 이름<input id="guest"></label></section><input type="hidden" id="token"><input type="submit" value="예약">'));
});
