import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTypography } from '../scripts/typography.mjs';

test('typography normalization clamps used font tokens without changing unrelated numbers', () => {
  const result = normalizeTypography(':root{--weight:400;--small:12px;--opacity:0.4}body{font-weight:var(--weight)}.badge{font-size:var(--small)}h1{font-size:24px;font-weight:700}');
  assert.match(result, /--weight:\s*500/);
  assert.match(result, /--small:\s*14px/);
  assert.match(result, /--opacity:\s*0\.4/);
  assert.match(result, /font-size:\s*24px/);
  assert.match(result, /font-weight:\s*700/);
  assert.equal(normalizeTypography(result), result);
});

test('control defaults precede explicit control typography', () => {
  const result = normalizeTypography('body{font-size:16px;font-weight:500}button{font-size:24px;font-weight:700}');
  assert.match(result, /font:\s*inherit/);
  assert.ok(result.search(/font:\s*inherit/) < result.indexOf('font-size:24px'));
});

test('font correction does not enlarge spacing through a shared token', () => {
  const result=normalizeTypography(':root{--unit:12px}.badge{font-size:var(--unit);padding:var(--unit)}');
  assert.match(result,/--unit:\s*12px/);
  assert.match(result,/font-size:\s*14px/);
  assert.match(result,/padding:\s*var\(--unit\)/);
});
