import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInterface } from '../scripts/service-interface.mjs';

test('stage boundary rejects renamed fields, wrong element types and duplicate IDs', () => {
  const required = { search: 'input', 'ticket-form': 'form' };
  assert.throws(() => validateInterface('<form id="search"><input id="query"></form>', required), /search/);
  assert.throws(() => validateInterface('<input id="search"><form id="ticket-form"></form><input id="search">', required), /exactly once/);
  assert.doesNotThrow(() => validateInterface('<input id="search"><form id="ticket-form"></form>', required));
});
