import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceFailureContext } from '../scripts/workflow-state.mjs';

test('repair receives actual visible actions alongside the expected failing action', () => {
  const context = serviceFailureContext({ name: 'booking', detail: 'Waiting for 예약하기', observed: { controls: [{ text: '예약 확정' }], panels: [{ id: 'booking-form', visible: true }] } });
  assert.match(context, /예약하기/);
  assert.match(context, /예약 확정/);
  assert.match(context, /booking-form/);
  assert.match(context, /untrusted data/);
});
